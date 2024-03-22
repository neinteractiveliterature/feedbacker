const config = require('config');
const { GraphQLClient } = require('graphql-request');
const _ = require('underscore');
const { URL } = require('url');
const c = require('ansi-colors');
const { parse } = require('graphql/language');
const cache = require('./cache');
const async = require('async');

// Stolen from the 3.x series of graphql-request.  This is a no-op tagged template function that
// exists just so that graphql-eslint can find the GraphQL template strings in this file for
// linting.
function gql(chunks, ...variables) {
    return chunks.reduce(
        (accumulator, chunk, index) => `${accumulator}${chunk}${index in variables ? variables[index] : ''}`,
        ''
    );
}

class InvalidTokenError {
}

async function graphQLRequest(client, query, variables = undefined){
    try {
        const parsedQuery = parse(query);
        const queryName = parsedQuery.definitions[0].name?.value;
        const start = new Date();

        const result = await async.retry(
            {
                times: 5,
                interval: function(retryCount) {
                    return 20 * Math.pow(2, retryCount);
                }
            },
            async function(){
                return client.request(query, variables);
            });
        if (config.get('app.debug')){
            console.log(`${c.green(`[GraphQL ${new Date().getTime() - start.getTime()}ms]`)} ${queryName} ${variables ? c.yellow(JSON.stringify(variables)) : ''}`);
        }
        return result;
    } catch (err) {
        if(err.response?.status === 401){
            throw new Intercode.InvalidTokenError();
        }
        throw err;
    }
}

function getClient(token) {
    return new GraphQLClient(
        config.get('app.graphqlURL'),
        {
            headers: {
                Authorization: 'Bearer ' + token
            },
        });
}

function getConventionDomain(baseUrl) {
    return new URL(baseUrl).hostname;
}

class Intercode {
    constructor(accessToken, refreshToken) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.client = getClient(this.accessToken);
    }

    request(query, variables = undefined) {
        return graphQLRequest(this.client, query, variables);
    }

    getUser() {
        const query = gql`query getUser {
            currentUser {
                id
                name
                email
            }
        }`;
        return this.request(query);
    }

    async getPermissions(userId, baseUrl) {
        const records = await cache.check('intercode-permissions', `${baseUrl}-${userId}`);
        if (records){
            return records;
        }
        const query = gql`query getPermissions($conventionDomain: String!, $userId: ID!) {
            user(id: $userId) {
                privileges
            }

            convention: conventionByDomain(domain: $conventionDomain) {
                user_con_profile_by_user_id(userId: $userId) {
                    id
                    staff_positions {
                        id
                        name
                    }
                }
            }
        }`;
        const variables = {
            userId,
            conventionDomain: getConventionDomain(baseUrl)
        };
        const result = await this.request(query, variables);
        const doc = {
            privileges: result.user.privileges,
            positions: _.pluck(result.convention.user_con_profile_by_user_id.staff_positions, 'name')
        };
        await cache.store('intercode-permissions', `${baseUrl}-${userId}`, doc);
        return doc;
    }

    async getAllPermissions(userId) {
        const records = await cache.check('intercode-all-permissions', userId);
        if (records){
            return records;
        }
        const query = gql`query getPermissions($userId: ID!) {
              user(id: $userId) {
                privileges
                user_con_profiles {
                  id
                  staff_positions {
                    id
                    name
                  }
                  convention {
                    id
                    name
                    domain
                  }
                }
              }
            }
        `;
        const variables = {
            userId
        };
        const result = await this.request(query, variables);
        const doc = {
            privileges: result.user.privileges,
            positions: {}
        };
        for (const profile of result.user.user_con_profiles){
            doc.positions[profile.convention.domain] =  _.pluck(profile.staff_positions, 'name');
        }
        await cache.store('intercode-all-permissions', userId, doc);
        return doc;
    }

    async getConventions(){
        const records = await cache.check('intercode-conventions', 'list');
        if (records){
            return records;
        }
        const query = gql`query getConventions {
            conventions_paginated(per_page:200) {
                current_page
                total_pages
                total_entries

                entries {
                   id
                   name
                   domain
                }
            }
        }`;
        const variables = {
        };
        const result = await this.request(query, variables);
        const doc = result.conventions_paginated.entries;
        await cache.store('intercode-conventions', 'list', doc);
        return doc;
    }

    async getMemberEvents(userId, baseUrl) {
        const records = await cache.check('intercode-member-events', `${baseUrl}-${userId}`);
        if (records){
            return records;
        }
        const query = gql`query getMemberEvents($userId: ID!, $conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                user_con_profile_by_user_id(userId: $userId) {
                    team_members {
                        id
                        display_team_member

                        event {
                            id
                            title
                            length_seconds
                            event_category {
                                name
                                team_member_name
                            }

                            runs {
                                id
                                starts_at
                                ends_at
                                rooms {
                                    id
                                    name
                                }
                            }

                            team_members {
                                id
                                display_team_member
                                user_con_profile {
                                    id
                                    name_without_nickname
                                }
                            }
                        }
                    }
                }
            }
        }`;
        const variables = {
            userId,
            conventionDomain: getConventionDomain(baseUrl),
        };
        const result = await this.request(query, variables);
        const events = _.pluck(result.convention.user_con_profile_by_user_id.team_members, 'event');
        await cache.store('intercode-member-events', `${baseUrl}-${userId}`, events);
        return events;
    }

    async getRun(eventId, runId, baseUrl) {
        const records = await cache.check('intercode-runs', runId);
        if (records){
            return records;
        }
        const query = gql`query getRun($conventionDomain: String!, $eventId: ID!, $runId: ID!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                event(id: $eventId) {
                    run(id: $runId) {
                        id
                        starts_at
                        ends_at

                        rooms {
                            id
                            name
                        }

                        event {
                            id
                            title
                            length_seconds
                            event_category {
                                name
                                team_member_name
                            }
                            team_members {
                                id
                                display_team_member
                                user_con_profile {
                                    id
                                    user_id
                                    name_without_nickname
                                }
                            }
                        }
                    }
                }
            }
        }`;
        const variables = {
            conventionDomain: getConventionDomain(baseUrl),
            eventId: eventId,
            runId: runId,
        };
        try {
            const result = await this.request(query, variables);
            await cache.store('intercode-runs', runId, result.convention.event.run);
            return result.convention.event.run;
        } catch (err) {
            if (err.toString().match(/Event not found/)) {
                return undefined;
            }
        }
    }

    async getEvents(baseUrl) {
        const records = await cache.check('intercode-events', baseUrl);
        if (records){
            return records;
        }
        const query = gql`query getEvents($conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                events {
                    id
                    title
                    event_category {
                        name
                        team_member_name
                    }
                    length_seconds
                    runs {
                        id
                        starts_at
                        ends_at
                        rooms {
                            id
                            name
                        }
                    }
                    team_members {
                        id
                        display_team_member
                        user_con_profile {
                            id
                            user_id
                            name_without_nickname
                        }
                    }
                }
            }
        }`;
        const variables = {
            conventionDomain: getConventionDomain(baseUrl)
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', 'all', result.convention.events);
        return result.convention.events;
    }
    async getEventsList(baseUrl) {
        const records = await cache.check('intercode-events', baseUrl);
        if (records){
            return records;
        }
        const query = gql`query getEvents($conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                events {
                    id
                    title
                    event_category {
                        name
                        team_member_name
                    }
                }
            }
        }`;
        const variables = {
            conventionDomain: getConventionDomain(baseUrl)
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', 'list', result.convention.events);
        return result.convention.events;
    }

    async getRooms(baseUrl) {
        const query = gql`query getRooms($conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                rooms {
                    id
                    name
                }
            }
        }`;
        const result = await this.request(query, { conventionDomain: getConventionDomain(baseUrl) });
        return result.convention.rooms;
    }

    async getConvention(baseUrl){
        const record = await cache.check('intercode-convention', baseUrl);
        if (record){
            return record;
        }

        const query = gql`query getConvention($conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                id
                name
                starts_at
                ends_at
            }
        }`;
        const result = await this.request(query, { conventionDomain: getConventionDomain(baseUrl) });
        await cache.store('intercode-convention', baseUrl, result.convention);
        return result.convention;
    }

    async getSignups(userId, baseUrl){
        const records = await cache.check('intercode-signups', `${baseUrl}-${userId}`);
        if (records){
            return records;
        }
        const query = gql `query getSignups($conventionDomain: String!, $userId: ID!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                user_con_profile_by_user_id(userId: $userId) {
                    signups {
                        id
                        state
                        bucket_key
                        counted

                        run {
                            id
                            starts_at
                            ends_at

                            rooms {
                                id
                                name
                            }

                            event {
                                id
                                title
                                length_seconds
                                event_category {
                                   name
                                   team_member_name
                                }
                                team_members {
                                    id
                                    display_team_member
                                    user_con_profile {
                                        id
                                        user_id
                                        name_without_nickname
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }`;
        const result = await this.request(query, {userId:userId, conventionDomain:getConventionDomain(baseUrl)});
        await cache.store('intercode-signups', `${baseUrl}-${userId}`, result.convention.user_con_profile_by_user_id.signups, 30);
        return result.convention.user_con_profile_by_user_id.signups;
    }

    async getEvent(id, baseUrl){
        const records = await cache.check('intercode-events', id);
        if (records){
            return records;
        }
        const query = gql`query getEvent($conventionDomain: String!, $id: ID!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                event(id: $id) {
                    id
                    title
                    length_seconds
                    event_category {
                        name
                        team_member_name
                    }
                    runs {
                        id
                        starts_at
                        ends_at
                        rooms {
                            id
                            name
                        }
                    }
                    team_members {
                        id
                        display_team_member
                        user_con_profile {
                            id
                            user_id
                            name_without_nickname
                        }
                    }
                }
            }
        }`;
        const variables = {
            conventionDomain: getConventionDomain(baseUrl),
            id: id,
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', id, result.convention.event);
        return result.convention.event;
    }

}

Intercode.InvalidTokenError = InvalidTokenError;

module.exports = Intercode;

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

function getConventionDomain() {
    return new URL(config.get('app.interconBaseURL')).hostname;
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

    async getPermissions(userId) {
        const records = await cache.check('intercode-permissions', userId);
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
            conventionDomain: getConventionDomain()
        };
        const result = await this.request(query, variables);
        const doc = {
            privileges: result.user.privileges,
            positions: _.pluck(result.convention.user_con_profile_by_user_id.staff_positions, 'name')
        };
        await cache.store('intercode-permissions', userId, doc);
        return doc;
    }

    async getMemberEvents(userId) {
        const records = await cache.check('intercode-member-events', userId);
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
            conventionDomain: getConventionDomain(),
        };
        const result = await this.request(query, variables);
        const events = _.pluck(result.convention.user_con_profile_by_user_id.team_members, 'event');
        await cache.store('intercode-member-events', userId, events);
        return events;
    }

    async getRun(eventId, runId) {
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
            conventionDomain: getConventionDomain(),
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

    async getEvents() {
        const records = await cache.check('intercode-events', 'all');
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
            conventionDomain: getConventionDomain()
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', 'all', result.convention.events);
        return result.convention.events;
    }
    async getEventsList() {
        const records = await cache.check('intercode-events', 'list');
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
            conventionDomain: getConventionDomain()
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', 'list', result.convention.events);
        return result.convention.events;
    }

    async getRooms() {
        const query = gql`query getRooms($conventionDomain: String!) {
            convention: conventionByDomain(domain: $conventionDomain) {
                rooms {
                    id
                    name
                }
            }
        }`;
        const result = await this.request(query, { conventionDomain: getConventionDomain() });
        return result.convention.rooms;
    }

    async getConvention(){
        const record = await cache.check('intercode-convention', 'default');
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
        const result = await this.request(query, { conventionDomain: getConventionDomain() });
        await cache.store('intercode-convention', 'default', result.convention);
        return result.convention;
    }

    async getSignups(userId){
        const records = await cache.check('intercode-signups', userId);
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
        const result = await this.request(query, {userId:userId, conventionDomain:getConventionDomain()});
        await cache.store('intercode-signups', userId, result.convention.user_con_profile_by_user_id.signups, 30);
        return result.convention.user_con_profile_by_user_id.signups;
    }

    async getEvent(id){
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
            conventionDomain: getConventionDomain(),
            id: id,
        };
        const result = await this.request(query, variables);
        await cache.store('intercode-events', id, result.convention.event);
        return result.convention.event;
    }

}

Intercode.InvalidTokenError = InvalidTokenError;

module.exports = Intercode;
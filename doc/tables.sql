
CREATE OR REPLACE FUNCTION update_created_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.created = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

create table users (
    id          serial,
    name        varchar(80),
    email       varchar(100),
    intercode_id  integer not null,
    PRIMARY KEY (id)
);


create table surveys (
    id          serial,
    name        varchar(80) not null,
    base_url    varchar(80) not null,
    created_by  int not null,
    created     timestamp default now(),
    published   boolean default false,
    primary key (id)
);

CREATE TRIGGER update_surveys_created BEFORE UPDATE
    ON surveys FOR EACH ROW EXECUTE PROCEDURE
    update_created_column();

create table questions (
    id          serial,
    survey_id   int not null,
    question    varchar(255) not null,
    description text,
    type        varchar(20),
    config      jsonb,
    display_order int not null,
    required    boolean default false,
    primary key (id),
    foreign key (survey_id)
        references surveys(id)
        on delete cascade
);

create table responses (
    id          serial,
    survey_id   int not null,
    user_id     int not null,
    anonymous   boolean default false not null,
    complete    boolean default false not null,
    tag         varchar(30),
    created     timestamp default now(),
    updated     timestamp default now(),
    primary key(id),
    foreign key (survey_id)
        references surveys(id)
        on delete cascade,
    foreign key (user_id)
        references users(id)
        on delete cascade
);

CREATE TRIGGER update_responses_created BEFORE UPDATE
    ON responses FOR EACH ROW EXECUTE PROCEDURE
    update_created_column();

create table feedback (
    id          serial,
    response_id int not null,
    event_id    int not null,
    concom      text,
    gm          text,
    gm_use_name boolean default false,
    recommend   int,
    skipped     boolean default false,
    created     timestamp default now(),
    primary key (id),
    foreign key (response_id)
        references responses(id)
        on delete cascade
);

CREATE TRIGGER update_feedback_created BEFORE UPDATE
    ON feedback FOR EACH ROW EXECUTE PROCEDURE
    update_created_column();

create table question_responses (
    id          serial,
    question_id int not null,
    response_id int not null,
    value       text,
    created     timestamp default now(),
    primary key (id),
    foreign key (question_id)
        references questions(id)
        on delete cascade,
    foreign key (response_id)
        references responses(id)
        on delete cascade
);

CREATE TRIGGER update_question_responses_created BEFORE UPDATE
    ON question_responses FOR EACH ROW EXECUTE PROCEDURE
    update_created_column();

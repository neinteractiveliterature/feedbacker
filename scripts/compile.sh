#!/bin/bash

# build assorted templates for client side
# Skills
./node_modules/pug-cli/index.js -c --name newFeedbackTemplate -o public/javascripts/templates/feedback views/feedback/modalNewForm.pug
./node_modules/pug-cli/index.js -c --name editFeedbackTemplate -o public/javascripts/templates/feedback views/feedback/modalEditForm.pug
./node_modules/pug-cli/index.js -c --name-after-file -o public/javascripts/templates/survey views/survey/templates/*.pug
./node_modules/pug-cli/index.js -c --name-after-file -o public/javascripts/templates/question views/question/templates/*.pug

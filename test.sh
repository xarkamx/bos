# run local in the background
yarn local &
sleep 15
yarn cucumber-js --require-module ts-node/register --require features/**/*.ts

fkill -f :8000




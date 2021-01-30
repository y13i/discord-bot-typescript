# discord-bot-typescript

An example/template repo for Discord bot with TypeScript and AWS infrastructure.

## Develop

```
$ npm install
$ npm run dev
```

## Deploy to AWS

```
# Put your bot's token to SSM Parameter Store.
$ aws ssm put-parameter \
  --name "/$APP_STACK_NAME/DISCORD_BOT_TOKEN" \
  --type "SecureString" \
  --value $DISCORD_BOT_TOKEN

# This deploys CodePipeline and CI resources. Then the pipeline deploys app.
$ aws cloudformation deploy \
  --stack-name "discord-bot-ci" \
  --template-file "infra/ci.cfn.json" \
  --capabilities "CAPABILITY_IAM" \
  --role-arn $CFN_ROLE_ARN \
  --parameter-overrides AppStackName=$APP_STACK_NAME GithubConnectionArn=$GITHUB_CONNECTION_ARN FullRepositoryId=$FULL_REPOSITORY_ID BranchName=$BRANCH_NAME SlackChannelId=$SLACK_CHANNEL_ID SlackWorkspaceId=$SLACK_WORKSPACE_ID
```

## Environment Variables

### `DISCORD_BOT_TOKEN`

[Obtain yours](https://discord.com/developers/applications).

### `AWS_REGION`, `AWS_DEFAULT_REGION`

Choose yours.

### `CFN_ROLE_ARN`

[Create yours](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/using-iam-servicerole.html).

### `APP_STACK_NAME`

Whatever.

### `GITHUB_CONNECTION_ARN`

[Connect to GitHub](https://console.aws.amazon.com/codesuite/settings/connections).

### `FULL_REPOSITORY_ID`

`user/repo`

### `BRANCH_NAME`

Whatever.

### `SLACK_CHANNEL_ID`, `SLACK_WORKSPACE_ID`

For pipeline notification. [Get them here](https://console.aws.amazon.com/chatbot/home?#/chat-clients).

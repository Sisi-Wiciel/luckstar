module.exports = {
  SOCKET: {
    PORT: 8889,
    AUTH_TIME_OUT: 1 * 1000,
    CLOSE_DELAY: 5 * 1000,
    AUTH_MAX_RETRY_TIMES: 5
  },
  ROOM: {
    COMPETE_MAX_TOPICS: 3,
    COMPETE_TOPIC_COUNTDOWN: 20
  },
  USER: {
    STATUS: {
      OFFLINE: '离线.',
      HOME_PAGE: '浏览首页.',
      IN_ROOM: '比赛房间,等待中.',
      IN_COMPETING: '比赛房间,答题中.',
      IN_COMPETING_WATCHING: '比赛房间,观战.',
      IN_TOPIC: '浏览题目页面.'
    },
    AUTH_EXPRIES_IN_MINUTES: 7 * 24 * 60, // token timeout (min)
    INACTIVE_IN_SECOND: 24 * 60 * 60 * 1000 // user inactive timeout
  },
  FILE: {
    UPLOAD_POLICY: {
      MAX_SIZE: 5 * 1024 * 1024,
      BLOCK_NUMBER: 10
    },
    UPLOAD_DIR: '/Users/kangta123/WebstormProjects/luckstar/client/libs/images/upload'
  },
  SECRET_KEY: "LuCk_StAr_SeCrEt"
};

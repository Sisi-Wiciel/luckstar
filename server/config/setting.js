module.exports = {
    SOCKET: {
        PORT: 8889,
        AUTH_TIME_OUT: 1000,
        CLOSE_DELAY: 5000,
        AUTH_MAX_RETRY_TIMES: 5
    },
    ROOM: {
        COMPETE_MAX_TOPICS: 5,
        COMPETE_TOPIC_COUNTDOWN: 15
    },
    USER: {
        STATUS: {
            OFFLINE: '离线.',
            HOME_PAGE: '浏览首页.',
            ROOMLIST_PAGE: '浏览答题页面.',
            IN_ROOM:  '房间中.',
            IN_COMPETING: '比赛中.'
        }
    },
    SECRET_KEY: "LuCk_StAr_SeCrEt"
};
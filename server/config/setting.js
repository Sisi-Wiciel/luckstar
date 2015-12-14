module.exports = {
    SOCKET: {
        PORT: 8889,
        AUTH_TIME_OUT: 1000,
        CLOSE_DELAY: 5000,
        AUTH_MAX_RETRY_TIMES: 5
    },
    ROOM: {
        COMPETE_MAX_TOPICS: 30,
        COMPETE_TOPIC_COUNTDOWN: 20
    },
    USER: {
        STATUS: {
            OFFLINE: '离线.',
            HOME_PAGE: '浏览首页.',
            ROOMLIST_PAGE: '浏览答题页面.',
            IN_ROOM:  '比赛房间,等待中.',
            IN_COMPETING: '比赛房间,答题中.',
            IN_COMPETING_WATCHING: '比赛房间,答题中(观看).',
            IN_TOPIC: '浏览题目页面.'
        }
    },
    SECRET_KEY: "LuCk_StAr_SeCrEt"
};
var redis = require("redis");
var rc = redis.createClient();
var Warlock = require('node-redis-warlock');
var warlock = Warlock(rc);
var lock = require("redis-lock")(rc);
console.info(rc);
//
//rc.on('ready', function () {
//    rc.set("inc",0)
//    for(var i=1;i<=10;i++){
//        rc.watch("inc")
//        rc.get("inc",function(err,data){
//            var multi = rc.multi()
//            data++ // I do know I can use rc.incr(), this is just for example
//            multi.set("inc",data)
//            multi.exec(function(err,replies){
//                console.log(replies)
//            })
//        })
//    }
//})
var key = 'opt-lock';
var ttl = 10000;
var maxAttempts = 4; // Max number of times to try setting the lock before erroring
var wait = 1000; // Time to wait before another attempt if lock already in place
rc.on('ready', function() {
  rc.set("inc", 0);
  for (var i = 1; i <= 3; i++) {
    //warlock.lock(key, ttl, function(err, unlock){
    //    if (err) {
    //        console.info(err)
    //        return;
    //    }
    //
    //    if (typeof unlock === 'function') {
    //        rc.get("inc", function (err, data) {
    //            console.info(data)
    //            rc.set("inc", ++data);
    //            unlock();
    //            console.info("unlock")
    //        });
    //    }else{
    //        console.info("the lock was not established ")
    //    }
    //
    //});


    lock("myLock", function(done) {
      rc.get("inc", function(err, data) {
        console.info(data);
        rc.set("inc", ++data, function() {
          done();
        });
        console.info("unlock");
        //done();

      });

    });
  }
});

// config/passport.js

import passport from "passport";
import passportLocal from "passport-local";
import User from "../models/User";

const LocalStrategy = passportLocal.Strategy;

// serailize & deserialize User
passport.serializeUser((user, done) => {
  // done 함수를 사용해서 식별할 수 있는 정보를 세션에 저장한다
  // 즉, user.id 를
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findOne({ _id: id }, (err, user) => {
    done(err, user);
  });
});

// local strategy
passport.use(
  "local-login",
  new LocalStrategy(
    {
      usernameField: "username",
      passwordField: "password",
      passReqToCallback: true,
    },
    (req, username, password, done) => {
      User.findOne({ username })
        // findOne 으로 찾은 데이터중 가져올 부분 지정
        // 예를 들어, select({password:1}) 같은 경우
        // 비밀번호만 가져오는 설정이고
        // select({password: 1, username: 1}) 같은 경우
        // 비밀번호와 username 을 가져온다
        // 참고로 select("password username") 과
        // select({password: 1, username: 1}) 은 같은 뜻이다
        // 참고로 찾은 document 의 데이터에는 _id 값이 무조건 포함되어 있다
        // 즉, 현재 실행문은 _id 값과 password 값을 가져온다
        .select({
          password: 1,
        })
        .exec((err, user) => {
          if (err) {
            return done(err);
          }

          if (user && user.authenticate(password)) {
            return done(null, user);
          } else {
            req.flash("username", username);
            req.flash("errors", {
              login: "The username or password is incoreect.",
            });
            return done(null, false);
          }
        });
    }
  )
);

module.exports = passport;

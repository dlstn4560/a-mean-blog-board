import mongoose from "mongoose";

// User schema
const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required!"],
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Password is required!"],
      select: false,
    },
    name: { type: String, required: [true, "Name is required!"] },
    email: { type: String },
  },
  {
    // toObject 함수를 사용하면 plain javascript object 로 변경할 수 있다
    // virtuals: true 는 virtual 로 설정된 항목들을 toObject 함수에서 표시하게 하는
    // 설정으로 기본적으로 virtual 들은 console.log 에서 표시 되지 않는다
    toObject: { virtuals: true },
  }
);

// User Schema Virtuals
// virtual 을 사용하는 이유?
// DB 에 저장하고 싶은 데이터는 아니지만, user 모델에서 사용하고 싶기 때문
userSchema
  .virtual("passwordConfirmation")
  .get(function () {
    return this._passwordConfirmation;
  })
  .set(function (value) {
    this._passwordConfirmation = value;
  });

userSchema
  .virtual("originalPassword")
  .get(function () {
    return this._originalPassword;
  })
  .set(function (value) {
    this._originalPassword = value;
  });

userSchema
  .virtual("currentPassword")
  .get(function () {
    return this._currentPassword;
  })
  .set(function (value) {
    this._currentPassword = value;
  });

userSchema
  .virtual("newPassword")
  .get(function () {
    return this._newPassword;
  })
  .set(function (value) {
    this._newPassword = value;
  });

// password validation
// 회원가입시 비밀번호 검사
userSchema.path("password").validate(function (v) {
  const user = this;

  // create user
  if (user.isNew) {
    if (!user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation is required."
      );
    }
    if (user.password !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }

  // update user
  if (!user.isNew) {
    if (!user.currentPassword) {
      user.invalidate("currentPassword", "Current Password is required!");
    } else if (user.currentPassword != user.originalPassword) {
      user.invalidate("currentPassword", "Current Password is invalid!");
    }

    if (user.newPassword !== user.passwordConfirmation) {
      user.invalidate(
        "passwordConfirmation",
        "Password Confirmation does not matched!"
      );
    }
  }
});

// model & export
// mongoose.model("user", userSchema) 이부분은 데이터베이스에
// userSchema 라는 형태를 가진 스키마를 "user" 라는 이름의 콜렉션으로 데이터베이스에 생성한다
const User = mongoose.model("user", userSchema);

module.exports = User;

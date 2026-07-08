const passport = require("passport");
const { Strategy: GoogleStrategy } = require("passport-google-oauth20");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await prisma.user.findUnique({
          where: { user_email: profile.emails[0].value },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              user_name: profile.displayName,
              user_email: profile.emails[0].value,
              user_password: "", // không có password vì login Google
            },
          });
        }

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

module.exports = passport;

import passport from "passport";
import bcrypt from "bcrypt";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByUsername, getUserById } from "../db/index.ts";

passport.use(
  new LocalStrategy(async (username, password, done) => {
    const user = await getUserByUsername(username);
    if (!user) return done(null, false, { message: "Incorrect username" });
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return done(null, false, { message: "Incorrect password" });
    return done(null, user);
  })
);

passport.serializeUser((user, done) => done(null, user.id));

passport.deserializeUser(async (id, done) => {
  const user = await getUserById(id);
  done(null, user);
});

export default passport;

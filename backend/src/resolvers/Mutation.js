const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { randomBytes } = require('crypto');
const { promisify } = require('util');

const Mutations = {
  async createItem(parent, args, ctx, info) {
    // TODO: Check if they are logged in

    const item = await ctx.db.mutation.createItem({
      data: {
        ...args
      }
    }, info);

    return item;
  },
  updateItem(parent, args, ctx, info) {
    // Take a copy of the arguments
    const updates = { ...args };
    // Remove the id
    delete updates.id;
    // Update the item in the db
    return ctx.db.mutation.updateItem({
      data: updates,
      where: {
        id: args.id
      },
    }, info);
  },
  async deleteItem(parent, args, ctx, info) {
    const where = { id: args.id };
    // 1. Find the item
    const item = await ctx.db.query.item({ where }, `{
      id
      title
    }`);
    // 2. Check if the user has permission to delete the item
    // TODO
    // 3. Delete the item
    return ctx.db.mutation.deleteItem({ where }, info);
  },
  async signup(parent, args, ctx, info) {
    // Make sure the email is lowercase
    args.email = args.email.toLowerCase();
    // Hash the password
    const password = await bcrypt.hash(args.password, 10);
    // Create the user in the db
    const user = await ctx.db.mutation.createUser(
      {
        data: {
          ...args,
          password,
          permissions: { set: ['USER'] },
        }
      },
      info
    );
    // create the JWT for them
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // Set the jwt as a cookie on the response
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365, // 1 year
    });
    // Return the user to the browser
    return user;
  },
  async signin(parent, { email, password }, ctx, info) {
    // 1. Check if there is a user with a matching email
    const user = await ctx.db.query.user({ where: { email }});
    if(!user) {
      throw new Error(`No such user found for email ${email}`);
    }
    // 2. Check if the password is correct
    const valid = await bcrypt.compare(password, user.password);
    if(!valid) {
      throw new Error(`Invalid password.`);
    }
    // 3. Generate their JWT
    const token = jwt.sign({ userId: user.id }, process.env.APP_SECRET);
    // 4. Set the cookie with the JWT
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // 5. Return the user
    return user;
  },
  signout(parent, args, ctx, info) {
    ctx.response.clearCookie('token');
    return { message: 'goodbye' };
  },
  async requestReset(parent, args, ctx, info) {
    // 1. Verify user
    const user = await ctx.db.query.user({ where: { email: args.email }});
    if(!user) {
      throw new Error(`No such user found for email ${args.email}`);
    }
    // 2. Set a reset token and expiry for user
    const randomBytesPromisified = promisify(randomBytes);
    const resetToken = (await randomBytesPromisified(20)).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000
    const res = await ctx.db.mutation.updateUser({
      where: { email: args.email },
      data: { resetToken, resetTokenExpiry },
    })
    console.log(res);
    return { message: 'Thanks yous!' };
    // 3. Email the reset token to the user
  },
  async resetPassword(parent, args, ctx, info) {
    // 1. Check if the passwords match
    if(args.password !== args.confirmPassword) {
      throw new Error('Passwords don\'t match.');
    }
    // 2. Check if valid reset token provided
    // 3. Check if token is expired
    const[user] = await ctx.db.query.users({
      where: {
        resetToken: args.resetToken,
        resetTokenExpiry_gte: Date.now() - 3600000,
      },
    })
    if(!user) {
      throw new Error('This token is either invalid or expired.')
    }
    // 4. Hash new password
    const password = await bcrypt.hash(args.password, 10);
    // 5. Save the new password to the user and remove reset token fields
    const updatedUser = await ctx.db.mutation.updateUser({
      where: { email: user.email },
      data: {
        password,
        resetToken: null,
        resetTokenExpiry: null,
      },
    })
    // 6. Generate JWT
    const token = jwt.sign({ userId: updatedUser.id }, process.env.APP_SECRET);
    // 7. Set the JWT cookie
    ctx.response.cookie('token', token, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 365,
    })
    // 8. return the new user
    return updatedUser;
  }
};

module.exports = Mutations;

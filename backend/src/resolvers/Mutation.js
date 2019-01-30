const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

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
  }
};

module.exports = Mutations;

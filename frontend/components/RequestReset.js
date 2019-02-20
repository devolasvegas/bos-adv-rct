import React, { Component } from 'react';
import { Mutation } from 'react-apollo';
import gql from 'graphql-tag';

import Form from './styles/Form';
import Error from './ErrorMessage';
import { CURRENT_USER_QUERY } from './User'

const REQUEST_RESET_MUTATION = gql`
  mutation REQUEST_RESET_MUTATION($email: String!, $password: String!) {
    signin(email: $email) {
      id
      email
    }
  }
`;

class Signin extends Component {
  state={
    email: '',
  };
  saveToState = e => {
    this.setState({[e.target.name]: e.target.value});
  }
  render() {
    return (
      <Mutation 
        mutation={REQUEST_RESET_MUTATION} 
        variables={this.state}
      >
        {(signin, {error, loading}) => (              
          <Form method="post" onSubmit={async e => {
            e.preventDefault();
            await signin();
            this.setState({email: '', name: '', password: ''});
          }}>
            <fieldset disabled={loading} aria-busy={loading}>
              <h2>Sign In to Your Account</h2>
              <Error error={error} />
              <label htmlFor="email">
                Email
                <input
                  type="email"
                  name="email"
                  placeholder="email"
                  value={this.state.email}
                  onChange={this.saveToState}
                />
              </label>
              <label htmlFor="password">
                Password
                <input
                  type="password"
                  name="password"
                  placeholder="password"
                  value={this.state.password}
                  onChange={this.saveToState}
                />
              </label>
              <button type="submit">Sign In</button>
            </fieldset>
          </Form>
        )
      }
      </Mutation>
    )
  }
}

export default Signin;

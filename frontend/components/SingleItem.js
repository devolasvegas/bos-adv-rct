import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import styled from 'styled-components';

import Error from './ErrorMessage';

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      largeImage
    }
  }
`;

class SingleItem extends Component {
  render() {
    return (
      <Query 
        query={ SINGLE_ITEM_QUERY } 
        variables={{ id: this.props.id }}
      >
        { ({ error, loading, data }) => {
          if(error) return <Error error={ error } />;
          if(loading) return <p>Loading &hellip;</p>;
          if(!data.item) return <p>No item found for ID: { this.props.id }</p>;
          console.log(data)
          return <p>Single Item Component, biiiiiiittttttccchhhhh!!!!</p>;
        } }
      </Query>
    )
  }
}

export default SingleItem;

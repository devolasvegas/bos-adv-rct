import React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

import PaginationStyles from './styles/PaginationStyles';
import { perPage } from '../config';

const PAGINATION_QUERY = gql`
  query PAGINATION_QUERY {
    itemsConnection {
      aggregate {
        count
      }
    }
  }
`;

const Pagination = props => (
  <PaginationStyles>
    <Query query={ PAGINATION_QUERY }>
      { ({ data, loading, error }) => {
        const count = data.itemsConnection.aggregate.count;
        const pages = count/perPage;
        if(loading) return <p>Loading &hellip;</p>;
        return (
          <p>Sup, I'm the pagination. { count }</p>
        )
        }
      }
    </Query>
  </PaginationStyles>
);

export default Pagination;
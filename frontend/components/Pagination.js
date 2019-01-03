import React from 'react';
import gql from 'graphql-tools';

import PaginationStyles from './styles/PaginationStyles';

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
    <p>Sup, I'm the pagination.</p>
  </PaginationStyles>
);

export default Pagination;
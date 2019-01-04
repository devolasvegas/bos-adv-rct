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
  <Query query={ PAGINATION_QUERY }>
      { ({ data, loading, error }) => {
        const count = data.itemsConnection.aggregate.count;
        const pages = Math.ceil(count/perPage);
        if(loading) return <p>Loading &hellip;</p>;
        return (
          <PaginationStyles>
            <p>Page { props.page } of { pages }</p>
          </PaginationStyles>
        )
        }
      }
    </Query>
);

export default Pagination;
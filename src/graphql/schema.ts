import { GraphQLSchema, GraphQLObjectType, GraphQLString, GraphQLFloat, GraphQLID } from 'graphql';

const MarketType = new GraphQLObjectType({
  name: 'Market',
  fields: {
    id: { type: GraphQLID },
    question: { type: GraphQLString },
    yesPrice: { type: GraphQLFloat },
    noPrice: { type: GraphQLFloat },
    volume: { type: GraphQLFloat },
    liquidity: { type: GraphQLFloat },
  },
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    market: {
      type: MarketType,
      args: { id: { type: GraphQLID } },
      resolve(parent, args) {
        // Fetch market data
        return fetchMarketById(args.id);
      },
    },
  },
});

export const schema = new GraphQLSchema({
  query: RootQuery,
});

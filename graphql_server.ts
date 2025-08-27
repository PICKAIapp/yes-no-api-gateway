import { ApolloServer } from '@apollo/server';
import { GraphQLScalarType } from 'graphql';
import { RateLimiter } from 'rate-limiter-flexible';
import Redis from 'ioredis';

const typeDefs = `#graphql
  scalar DateTime
  scalar BigInt
  
  type Market {
    id: ID!
    question: String!
    probability: Float!
    volume: BigInt!
    liquidity: BigInt!
    resolution: DateTime
    oracle: Oracle!
    bets: [Bet!]!
    trades(first: Int, after: String): TradeConnection!
  }
  
  type Query {
    market(id: ID!): Market
    markets(filter: MarketFilter, first: Int = 20): [Market!]!
    user(address: String!): User
    leaderboard(period: Period!): [User!]!
  }
  
  type Mutation {
    placeBet(input: BetInput!): BetResult!
    addLiquidity(marketId: ID!, amount: BigInt!): LiquidityResult!
    createMarket(input: MarketInput!): Market!
  }
  
  type Subscription {
    marketUpdate(marketId: ID!): Market!
    priceChange(marketId: ID!): PriceUpdate!
    tradeStream(marketId: ID): Trade!
  }
`;

const resolvers = {
  Query: {
    market: async (_, { id }, { dataSources }) => {
      return dataSources.marketAPI.getMarket(id);
    },
  },
  Mutation: {
    placeBet: async (_, { input }, { dataSources, user }) => {
      // Rate limiting
      await rateLimiter.consume(user.id);
      // Transaction processing
      return dataSources.marketAPI.placeBet(input, user);
    },
  },
  Subscription: {
    marketUpdate: {
      subscribe: (_, { marketId }, { pubsub }) => {
        return pubsub.asyncIterator([`MARKET_UPDATE_${marketId}`]);
      },
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  cache: new RedisCache({ redis }),
  plugins: [
    rateLimitPlugin(),
    authPlugin(),
    metricsPlugin(),
    tracingPlugin(),
  ],
});

export default server;

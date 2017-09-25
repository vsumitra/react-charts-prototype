import React from 'react';
import Market from './Market';

const MarketList = (props) =>{
  const { markets, selectedMarkets } = props;
  return(
    <div>
      {Object.values(markets).map((market) =>
        <Market
          key={market.id}
          market={market}
          selected={selectedMarkets.includes(market.id)}
        />
      )}
    </div>
  );
};

export default MarketList;
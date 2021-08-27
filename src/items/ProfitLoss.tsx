import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow
} from '@material-ui/core';
import millify from 'millify';
import moment from 'moment';
import React, { useEffect } from 'react';
import { ITradeRoute } from '../config/ITradeRoute';
import { IESIStatic } from './esi-static';
import { calculateProfitLoss, ProfitLossLine } from './profit-loss-service';
import { ProfitLossChart } from './ProtitLossChart';

export const ProfitLoss: React.FC<{
  itemDef: IESIStatic;
  itemId: number;
  route: ITradeRoute;
}> = ({ itemDef, itemId, route }) => {
  const [pl, setPL] = React.useState<ProfitLossLine[]>([]);
  const [showTable, setShowTable] = React.useState(false);

  useEffect(() => {
    calculateProfitLoss(itemDef, itemId, route).then((pl) => {
      setPL(pl);
    });
  }, [itemId]);

  const toggleShowTable = () => {
    setShowTable((showTable) => !showTable);
  };

  return (
    <div onClick={toggleShowTable}>
      <h2>Profit Loss</h2>
      {showTable && (
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>When</TableCell>
              <TableCell>Buy / Sell</TableCell>
              <TableCell>Qty</TableCell>
              <TableCell>Profit</TableCell>
              <TableCell>Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {pl.map((p, i) => (
              <TableRow key={i}>
                <TableCell>{moment(p.date).format('YYYY-MM-DD')}</TableCell>
                <TableCell>
                  {millify(p.buyPrice, { precision: 4 })} /{' '}
                  {millify(p.sellPrice, { precision: 4 })}
                </TableCell>
                <TableCell>{millify(p.qty)}</TableCell>
                <TableCell>
                  {millify(p.profit)} (<b>{p.profitPercent}%</b>)
                </TableCell>
                <TableCell>{millify(p.total)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {pl && <ProfitLossChart profitLoss={pl} />}
    </div>
  );
};

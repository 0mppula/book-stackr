import { FC } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';

import { selectReadBooksDataByMedium } from '../../features/books/selectors';

const StatsHeader: FC = () => {
	const {
		totalBooks,
		audioBooks,
		eBooks,
		paperBooks,
		audioBooksPercent,
		eBooksPercent,
		paperBooksPercent,
	} = useSelector((state: RootState) => selectReadBooksDataByMedium(state));

	return (
		<div className="stats-header-container no-padding">
			<div className="stats-header-item">
				<h2>Books Read</h2>

				<p className="total">{totalBooks}</p>
				<p className="total-percent">100%</p>
			</div>

			<div className="stats-header-item">
				<h2>Audio Books</h2>

				<p className="total">{audioBooks}</p>
				<p className="total-percent">{audioBooksPercent}</p>
			</div>

			<div className="stats-header-item">
				<h2>E-Books</h2>

				<p className="total">{eBooks}</p>
				<p className="total-percent">{eBooksPercent}</p>
			</div>

			<div className="stats-header-item">
				<h2>Paper Books</h2>

				<p className="total">{paperBooks}</p>
				<p className="total-percent">{paperBooksPercent}</p>
			</div>
		</div>
	);
};

export default StatsHeader;

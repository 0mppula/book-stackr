import { formatDistance } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { selectRecentlyReadBooks } from '../../features/books/selectors';
import CategoryLink from '../shared/CategoryLink';

const RecentReads = () => {
	const books = useSelector((state: RootState) => selectRecentlyReadBooks(state));

	return (
		<>
			<div className="stats-header-container">
				{books.map((book, i) => {
					if (book) {
						return (
							<div key={book.id} className="recently-read-item">
								<div>
									<p>
										Read{' '}
										{formatDistance(
											new Date(book.lastReadAt as string),
											new Date(),
											{
												addSuffix: true,
											}
										)}
									</p>

									<h2>{book.title}</h2>
									<p>By: {book.author}</p>
								</div>

								<hr />

								<div
									style={{
										display: 'flex',
										flexWrap: 'wrap',
										gap: '8px',
										justifyContent: 'center',
									}}
								>
									{book.category.map((category: string) => (
										<CategoryLink
											key={`category-${category}`}
											category={category}
										/>
									))}
								</div>
							</div>
						);
					} else {
						return (
							<div key={`book-${i}`} className="recently-read-item">
								<p className="no-books">
									Read more books to display a recent read here.
								</p>
							</div>
						);
					}
				})}
			</div>
		</>
	);
};

export default RecentReads;

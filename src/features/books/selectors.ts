import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../app/store';
import { bookCategories } from '../../assets/data/bookSelectValues';
import { bookType } from '../../assets/data/books';
import { selectItemType } from '../../components/FormComponents/FormTypes';

export interface tableRowDataType {
	[key: string]: string | number;
}
export interface chartDataType {
	[key: string]: string[] | number[];
}

export interface categoryCountDataType {
	[key: string]: number;
}

export const booksStateSelector = (state: RootState) => state.books;
const booksYearReadFilterSelector = (state: RootState) => state.books.yearReadFilters;
const booksCategoryFilterSelector = (state: RootState) => state.books.categoryFilters;
export const booksSelector = (state: RootState) => state.books.books;
const booksLoadingSelector = (state: RootState) => state.books.loading;
const booksMessageSelector = (state: RootState) => state.books.message;
const booksErrorSelector = (state: RootState) => state.books.error;

export const selectBooksLoadingState = createSelector([booksLoadingSelector], (loadingState) => {
	return loadingState;
});

export const selectBooksMessageAndError = createSelector(
	[booksMessageSelector, booksErrorSelector],
	(message, error) => {
		return { message, error };
	}
);

export const selectQueryFilteredBooks = createSelector([booksStateSelector], (booksState) => {
	const { books, query, statusFilters, yearReadFilters, categoryFilters } = booksState;

	const filteredBooks = books?.filter((book) => {
		const queryMatchesAuthor = book.author.toLowerCase().includes(query.toLowerCase());
		const queryMatchesTitle = book.title.toLowerCase().includes(query.toLowerCase());
		const statusFilterMatchesBook = statusFilters.some((status) => status === book.status);
		const yearReadFiltersMatchesBook = yearReadFilters.some(
			(yFilter) => yFilter.value === null || yFilter.value === book.yearRead
		);
		const categoryFiltersMatchesBook = categoryFilters.some(
			(cFilter) => cFilter.value === null || book.category.includes(cFilter.value)
		);

		return (
			(queryMatchesAuthor || queryMatchesTitle) &&
			statusFilterMatchesBook &&
			yearReadFiltersMatchesBook &&
			categoryFiltersMatchesBook
		);
	});

	return filteredBooks;
});

export const selectBookFilters = createSelector([booksStateSelector], (booksState) => {
	const { statusFilters, yearReadFilters, categoryFilters } = booksState;

	return { statusFilters, yearReadFilters, categoryFilters };
});

export const selectBooksTableSelectFilterOptions = createSelector(
	[booksStateSelector, booksYearReadFilterSelector, booksCategoryFilterSelector],
	(booksState, booksYearReadFiltersState, booksCategoryFiltersState) => {
		const { books } = booksState;
		const yearReadFilters = booksYearReadFiltersState;
		const categoryFilters = booksCategoryFiltersState;

		let yearReadFilterOptions: selectItemType[] = [{ label: 'All years', value: null }];
		let categoryFilterOptions: selectItemType[] = [{ label: 'All categories', value: null }];

		books.forEach((book) => {
			if (!yearReadFilterOptions.some((filter) => filter.value === book.yearRead)) {
				yearReadFilterOptions.push({ label: `${book.yearRead}`, value: book.yearRead });
			}

			// If any of the books categories are not in the categoryFilterOptions, add them.
			if (
				!categoryFilterOptions.some((filter) =>
					book.category.every((c) => c === filter.value)
				)
			) {
				// Only add the category if it is not already in the categoryFilterOptions.
				book.category.forEach((category) => {
					if (!categoryFilterOptions.some((filter) => filter.value === category)) {
						categoryFilterOptions.push({ label: `${category}`, value: category });
					}
				});
			}

			return;
		});

		// Sort the filter options in ascending and alphabetical order.
		yearReadFilterOptions.sort((a, b) => a.value - b.value);
		categoryFilterOptions.sort((a, b) => (a.label > b.label ? 1 : -1));

		// If other yearReadFilterOptions or categoryFilterOptions are selected, remove the default filters.
		if (yearReadFilters.some((filter) => filter.value !== null)) {
			yearReadFilterOptions = yearReadFilterOptions.filter((filter) => filter.value !== null);
		}

		if (categoryFilters.some((filter) => filter.value !== null)) {
			categoryFilterOptions = categoryFilterOptions.filter((filter) => filter.value !== null);
		}

		return { yearReadFilterOptions, categoryFilterOptions };
	}
);

export const selectBookById = createSelector(
	[booksSelector, (state, bookId: string | null) => bookId],
	(bookState, bookId) => {
		const book = bookState?.filter((book) => book.id === bookId)?.[0];

		return book;
	}
);

export const selectMaxBookIndex = createSelector([booksSelector], (books) => {
	let max = Math.max(...books.map((book) => book.index));
	return isFinite(max) ? max : 0;
});

export const selectReadBooksCount = createSelector([booksSelector], (books) => {
	const booksRead = books
		.filter((book) => book.status === 'read')
		.reduce((a: number) => (a += 1), 0);

	return booksRead;
});

export const selectReadBooksDataByMedium = createSelector([booksSelector], (books) => {
	const readBooks = books.filter((book) => book.status === 'read');

	let totalBooks: number = readBooks?.length;
	let audioBooks: number = 0;
	let eBooks: number = 0;
	let paperBooks: number = 0;
	let audioBooksPercent: string = '';
	let eBooksPercent: string = '';
	let paperBooksPercent: string = '';

	readBooks.forEach((book) => {
		if (book.readingMedium === 'audio') {
			audioBooks++;
		}
		if (book.readingMedium === 'e-book') {
			eBooks++;
		}
		if (book.readingMedium === 'paper') {
			paperBooks++;
		}
	});

	audioBooksPercent = totalBooks ? `${((audioBooks / totalBooks) * 100).toFixed(2)}%` : '0.00%';
	eBooksPercent = totalBooks ? `${((eBooks / totalBooks) * 100).toFixed(2)}%` : '0.00%';
	paperBooksPercent = totalBooks ? `${((paperBooks / totalBooks) * 100).toFixed(2)}%` : '0.00%';

	return {
		totalBooks,
		audioBooks,
		eBooks,
		paperBooks,
		audioBooksPercent,
		eBooksPercent,
		paperBooksPercent,
	};
});

export const selectRecentlyReadBooks = createSelector([booksSelector], (books) => {
	let recentlyReadBooks: (bookType | null)[] = books.filter(
		(book) => book.status === 'read' && book.lastReadAt !== null
	);
	const BOOK_COUNT = 4;

	recentlyReadBooks = recentlyReadBooks
		.sort((a, b) =>
			new Date(a?.lastReadAt as string) > new Date(b?.lastReadAt as string) ? -1 : 1
		)
		.slice(0, BOOK_COUNT);

	// Add null values to the end of the array if there are less than 4 recently read books.
	if (recentlyReadBooks.length < BOOK_COUNT) {
		recentlyReadBooks = [
			...recentlyReadBooks,
			...Array.from({ length: BOOK_COUNT - recentlyReadBooks.length }, () => null),
		];
	}

	return recentlyReadBooks;
});

export const selectReadBooksChartTableData = createSelector([booksSelector], (books) => {
	// Only check read books.
	const readBooks = books.filter((book) => book.status === 'read');

	const tableData: tableRowDataType[] = [];
	const chartData: chartDataType = {};

	const totalBooksReadByYear: number[] = [];
	const audioBooksReadByYear: number[] = [];
	const eBooksReadByYear: number[] = [];
	const paperBooksReadByYear: number[] = [];
	const eBooksPercentByYear: string[] = [];
	const audioPercentByYear: string[] = [];
	const paperPercentByYear: string[] = [];
	const booksPerWeekByYear: string[] = [];

	const uniqueYears = readBooks
		.filter((book, i) => readBooks.findIndex((book2) => book2.yearRead === book.yearRead) === i)
		.map((book) => book.yearRead)
		.sort((a, b) => (a > b ? 1 : -1));

	// Store total books read by year and by year and medium.
	uniqueYears.forEach((uniqueYear, i) => {
		let currYtotalBooksRead = 0;
		let currYtotalAudioBooksRead = 0;
		let currYtotalEBooksRead = 0;
		let currYtotalPaperBooksRead = 0;

		readBooks.forEach((book) => {
			if (book.yearRead === uniqueYear) {
				currYtotalBooksRead++;
			}

			if (book.readingMedium === 'audio' && book.yearRead === uniqueYear) {
				currYtotalAudioBooksRead++;
			}

			if (book.readingMedium === 'e-book' && book.yearRead === uniqueYear) {
				currYtotalEBooksRead++;
			}

			if (book.readingMedium === 'paper' && book.yearRead === uniqueYear) {
				currYtotalPaperBooksRead++;
			}
		});

		totalBooksReadByYear[i] = currYtotalBooksRead;
		audioBooksReadByYear[i] = currYtotalAudioBooksRead;
		eBooksReadByYear[i] = currYtotalEBooksRead;
		paperBooksReadByYear[i] = currYtotalPaperBooksRead;
	});

	let todayTime = new Date().getTime();
	let currentYear = new Date().getFullYear();
	let startOfYearTime = new Date(currentYear, 0, 1).getTime();
	let daysElapsed = +Math.floor((todayTime - startOfYearTime) / (24 * 60 * 60 * 1000));

	// Store total books read per week by year and the percent of each book medium read by year.
	uniqueYears.forEach((uniqueYear, i) => {
		let weeksElapsedOnYear = 52;

		if (uniqueYear === currentYear) {
			weeksElapsedOnYear = Math.ceil(daysElapsed / 7);
		}

		booksPerWeekByYear[i] = (
			(audioBooksReadByYear[i] + eBooksReadByYear[i] + paperBooksReadByYear[i]) /
			weeksElapsedOnYear
		).toFixed(2);

		audioPercentByYear[i] = `${(
			(audioBooksReadByYear[i] / totalBooksReadByYear[i]) *
			100
		).toFixed(2)}%`;

		eBooksPercentByYear[i] = `${((eBooksReadByYear[i] / totalBooksReadByYear[i]) * 100).toFixed(
			2
		)}%`;

		paperPercentByYear[i] = `${(
			(paperBooksReadByYear[i] / totalBooksReadByYear[i]) *
			100
		).toFixed(2)}%`;
	});

	const dataFields: string[] = [
		'years',
		'totalBooksReadByYear',
		'audioBooksReadByYear',
		'eBooksReadByYear',
		'paperBooksReadByYear',
		'eBooksPercentByYear',
		'audioPercentByYear',
		'paperPercentByYear',
		'booksPerWeekByYear',
	];

	const bookDataByYear: (number[] | string[])[] = [
		uniqueYears,
		totalBooksReadByYear,
		audioBooksReadByYear,
		eBooksReadByYear,
		paperBooksReadByYear,
		eBooksPercentByYear,
		audioPercentByYear,
		paperPercentByYear,
		booksPerWeekByYear,
	];

	// Map for each unique year a object with that years data.
	uniqueYears.forEach((_, i) => {
		tableData[i] = {};

		dataFields.forEach((dataField, fieldIndex) => {
			tableData[i][dataField as keyof tableRowDataType] = bookDataByYear[fieldIndex][i];
		});
	});

	// Add a key for each by year book data point to the chartData object.
	dataFields.forEach((dataField, fieldIndex) => {
		chartData[dataField as keyof chartDataType] = bookDataByYear[fieldIndex];
	});

	return { tableData, chartData };
});

export const selectReadBooksByYearByCategory = createSelector([booksSelector], (books) => {
	// Only check read books.
	const readBooks = books.filter((book) => book.status === 'read');
	let categories: Set<string> = new Set<string>();
	let categoryDatasets: { label: string; data: number[]; backgroundColor: string }[] = [];

	const uniqueYears = readBooks
		.filter((book, i) => readBooks.findIndex((book2) => book2.yearRead === book.yearRead) === i)
		.map((book) => book.yearRead)
		.sort((a, b) => (a > b ? 1 : -1));

	// Store the unique categories in a set.
	readBooks.forEach((book) => {
		book.category.forEach((category) => {
			let categoryWords = category.split(' ');
			let capitalizedCategory = categoryWords
				.map((cw) => cw[0].toUpperCase() + cw.substring(1))
				.join(' ');

			categories.add(capitalizedCategory);
		});
	});

	Array.from(categories)
		.sort((a, b) => (a > b ? 1 : -1))
		.forEach((category, i) => {
			categoryDatasets.push({
				label: category,
				data: uniqueYears.map((year) => {
					let booksReadByCategory = readBooks.filter((book) => {
						return (
							book.yearRead === year &&
							book.category.some((bookCat) => {
								let categoryWords = bookCat.split(' ');
								let capitalizedCategory = categoryWords
									.map((cw) => cw[0].toUpperCase() + cw.substring(1))
									.join(' ');

								return capitalizedCategory === category;
							})
						);
					});

					return booksReadByCategory.length;
				}),
				backgroundColor: (bookCategories.find((bc) => bc.label === category)?.color ||
					'#fff') as string,
			});
		});

	return { years: uniqueYears, datasets: categoryDatasets };
});

export const selectReadBooksCategoriesChartData = createSelector([booksSelector], (books) => {
	const readBooks = books.filter((book) => book.status === 'read');
	const categoryCountData: categoryCountDataType = {};
	let categories: string[] = [];
	let categoryCounts: number[] = [];

	readBooks.forEach((book) => {
		// Iterate over each books categories.
		book.category.forEach((category) => {
			if (category in categoryCountData) {
				// Count each category and place it in the corresponding category key of "categoryCountData".
				categoryCountData[category]++;
			} else {
				// Initialize a new category key with a value of 1.
				categoryCountData[category] = 1;
			}
		});
	});

	// Sort the categories and categoryCounts by descending prevelancy.
	categories = Object.keys(categoryCountData).sort(
		(a, b) => categoryCountData[b] - categoryCountData[a]
	);
	categoryCounts = categories.map((category) => categoryCountData[category]);
	// Capitalize the categories.
	categories = categories.map((category) => {
		let categoryWords = category.split(' ');
		let capitalizedCategory = categoryWords
			.map((cw) => cw[0].toUpperCase() + cw.substring(1))
			.join(' ');

		return capitalizedCategory;
	});

	return { categories, categoryCounts };
});

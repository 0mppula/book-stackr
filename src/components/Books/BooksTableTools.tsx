import { format } from 'date-fns';
import { FC, useEffect, useState } from 'react';
import { CSVLink } from 'react-csv';
import { FaBook, FaCircleNotch, FaFileDownload, FaFilter, FaPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { bookCategories } from '../../assets/data/bookSelectValues';
import { bookStatusType } from '../../assets/data/books';
import {
	selectBookFilters,
	selectBooksTableSelectFilterOptions,
	selectQueryFilteredBooks,
} from '../../features/books/selectors';
import {
	resetAllFilters,
	setCategoryFilters,
	setQuery,
	setStatusFilters,
	setYearReadFilters,
} from '../../features/books/slice';
import { selectItemType } from '../FormComponents/FormTypes';
import SelectInput from '../FormComponents/SelectInput';
import AddBookModal from '../Modals/AddBookModal';
import CustomCheckbox from './CustomCheckbox';

const BooksTableTools: FC = () => {
	const [canGenerateCSV, setCanGenerateCSV] = useState(true);
	const [addModalOpen, setAddModalOpen] = useState<boolean>(false);
	const [internalQuery, setInternalQuery] = useState('');

	const books = useSelector((state: RootState) => selectQueryFilteredBooks(state));
	const { statusFilters, yearReadFilters, categoryFilters } = useSelector((state: RootState) =>
		selectBookFilters(state)
	);
	const { yearReadFilterOptions, categoryFilterOptions } = useSelector((state: RootState) =>
		selectBooksTableSelectFilterOptions(state)
	);

	const dispatch = useDispatch();

	const defaultYearReadFilterIsSelected = yearReadFilters.some((filter) => filter.value === null);
	const defaultCategoryFilterIsSelected = categoryFilters.some((filter) => filter.value === null);

	const bookFiltersSelected = [
		!defaultYearReadFilterIsSelected,
		!defaultCategoryFilterIsSelected,
		statusFilters.length < 3,
		internalQuery !== '',
	].some((condition) => condition);

	useEffect(() => {
		let bounce = setTimeout(() => {
			dispatch(setQuery(internalQuery));
		}, 250);

		return () => clearTimeout(bounce);
	}, [internalQuery]);

	const handleDebounce = (e: React.ChangeEvent<HTMLInputElement>) => {
		setInternalQuery(e.target.value);
	};

	const handleStatusFilter = (e: React.ChangeEvent<HTMLInputElement>) => {
		let filterName = e.target.name as bookStatusType;
		let toggled = statusFilters.includes(filterName);
		let newFilters = toggled
			? [...statusFilters].filter((f) => f !== filterName)
			: [...statusFilters, filterName];

		dispatch(setStatusFilters(newFilters));
	};

	const handleSelectMultiChange = (e: selectItemType[], field: string) => {
		if (e.length === 0 && field === 'yearReadFilter') {
			dispatch(setYearReadFilters([{ label: 'All years', value: null }]));
			return;
		}

		if (e.length === 0 && field === 'categoryFilter') {
			dispatch(setCategoryFilters([{ label: 'All categories', value: null }]));
			return;
		}

		// Remove the default option when a filter is selected.
		if (e.some((option) => option.value !== null)) {
			e = e.filter((option) => option.value !== null);
		}

		if (field === 'categoryFilter') {
			// In addition to setting the category filters, assign a color to each category.
			dispatch(
				setCategoryFilters(
					e.map((option) => {
						return {
							label: option.label,
							value: option.value,
							color: bookCategories.find(
								(category) => category.value === option.value
							)?.color,
						};
					})
				)
			);
		}

		if (field === 'yearReadFilter') {
			dispatch(setYearReadFilters(e));
		}
	};

	const generateCSVData = () => {
		const headers = ['#', 'Autor', 'Title', 'Category', 'Medium', 'Year', 'Status'];

		const rows = books.map((book, index) => {
			return [
				index + 1,
				book.author,
				book.title,
				book.category
					.map((category) =>
						category
							.split(' ')
							.map((word) => word[0].toUpperCase() + word.slice(1))
							.join(' ')
					)
					.join(', '),
				book.readingMedium,
				book.yearRead,
				book.status,
			];
		});

		return [headers, ...rows];
	};

	const toggleCSVRateLimit = () => {
		setCanGenerateCSV(false);

		setTimeout(() => {
			setCanGenerateCSV(true);
		}, 1000);
	};

	return (
		<>
			<AddBookModal modalOpen={addModalOpen} setModalOpen={setAddModalOpen} />

			<div
				className="book-count"
				title={`${books.length} ${books.length === 1 ? 'book' : 'books'}`}
			>
				{books.length} <FaBook style={{ fontSize: '90%' }} />
			</div>

			<div className="table-tools">
				<div className="filters-buttons-container">
					<div className="filters">
						<CustomCheckbox
							label="Read"
							name="read"
							onChange={(e) => handleStatusFilter(e)}
							checked={statusFilters.some((filter) => filter === 'read')}
						/>

						<CustomCheckbox
							label="Reading"
							name="reading"
							onChange={(e) => handleStatusFilter(e)}
							checked={statusFilters.some((filter) => filter === 'reading')}
						/>

						<CustomCheckbox
							label="Want to read"
							name="want to read"
							onChange={(e) => handleStatusFilter(e)}
							checked={statusFilters.some((filter) => filter === 'want to read')}
						/>
					</div>

					<div className="buttons">
						<button
							aria-label="Clear all filters"
							title={
								!bookFiltersSelected ? 'No filters selected' : 'Clear all filters'
							}
							disabled={!bookFiltersSelected}
							className="btn-icon"
							onClick={() => {
								dispatch(resetAllFilters());
								setInternalQuery('');
							}}
						>
							<FaFilter />
							Clear
						</button>

						<CSVLink
							aria-label="Download books data as CSV"
							title="Download books data as CSV"
							tabIndex={canGenerateCSV ? 0 : -1}
							aria-disabled={!canGenerateCSV}
							onClick={toggleCSVRateLimit}
							data={generateCSVData()}
							filename={`books-${format(Date.now(), 'dd-MM-yyyy')}.csv`}
							className={`btn btn-icon ${!canGenerateCSV ? 'disabled' : ''}`}
							target="_blank"
						>
							{canGenerateCSV ? (
								<FaFileDownload />
							) : (
								<span className="spin">
									<FaCircleNotch />
								</span>
							)}{' '}
							.csv
						</CSVLink>

						<button
							aria-label="Add a new book"
							title="Add a new book"
							className="btn-icon"
							onClick={() => setAddModalOpen(true)}
						>
							<FaPlus /> Add
						</button>
					</div>
				</div>

				<div className="query-select-container">
					<div className="query">
						<input
							type="search"
							placeholder="Search by title or author..."
							value={internalQuery}
							onChange={(e) => handleDebounce(e)}
						/>
					</div>

					<div className="select-container">
						<div
							className={
								defaultYearReadFilterIsSelected
									? 'disabled-first-select-option'
									: ''
							}
						>
							<SelectInput
								value={yearReadFilters}
								name="yearReadFilter"
								handleChange={handleSelectMultiChange}
								options={yearReadFilterOptions}
								placeholder="Select books by year..."
								errorPlaceholder={false}
								isSearchable
								isMulti
							/>
						</div>

						<div
							className={
								defaultCategoryFilterIsSelected
									? 'disabled-first-select-option'
									: ''
							}
						>
							<SelectInput
								value={categoryFilters}
								name="categoryFilter"
								handleChange={handleSelectMultiChange}
								options={categoryFilterOptions}
								placeholder="Select books by category..."
								errorPlaceholder={false}
								isSearchable
								isMulti
							/>
						</div>
					</div>
				</div>
			</div>
		</>
	);
};

export default BooksTableTools;

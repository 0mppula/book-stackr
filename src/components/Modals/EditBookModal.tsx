import React, { FC, useRef, useState, useEffect } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { useDispatch, useSelector } from 'react-redux';

import { bookCategories, bookMediums, bookStatuses } from '../../assets/data/bookSelectValues';
import { selectBookById } from '../../features/books/selectors';
import { deleteBook, editBook } from '../../features/books/slice';
import useCloseOnOverlayClickOrEsc from '../../hooks/useCloseOnOverlayClickOrEsc';
import useFocusTrap from '../../hooks/useFocusTrap';
import { getInitialBookFormState } from '../FormComponents/FormData';
import FormGroup from '../FormComponents/FormGroup';
import { bookFormDataType, editBookReqBodyType, selectItemType } from '../FormComponents/FormTypes';
import SelectInput from '../FormComponents/SelectInput';
import TextInput from '../FormComponents/TextInput';

interface EditBookModalProps {
	modalOpen: boolean;
	setModalOpen: Function;
	editBookId: string | null;
	setEditBookId: Function;
}

const EditBookModal: FC<EditBookModalProps> = ({
	modalOpen,
	setModalOpen,
	editBookId,
	setEditBookId,
}) => {
	const [formData, setFormData] = useState<bookFormDataType>(getInitialBookFormState);

	const book: any = useSelector((state) => selectBookById(state, editBookId));

	const dispatch = useDispatch<any>();

	useEffect(() => {
		let newFormState: bookFormDataType = getInitialBookFormState();

		if (book) {
			const selectValues = ['category', 'readingMedium', 'status'];

			for (const [key, _] of Object.entries(newFormState)) {
				// Check if looping over a select field.
				if (selectValues.includes(key)) {
					// Populate multi select.
					if (Array.isArray(book[key])) {
						newFormState = {
							...newFormState,
							[key]: {
								...newFormState[key as keyof bookFormDataType],
								value: book[key].map((key: any) => ({ label: key, value: key })),
							},
						};
						// Populate normal select.
					} else {
						newFormState = {
							...newFormState,
							[key]: {
								...newFormState[key as keyof bookFormDataType],
								value: {
									label: book[key][0].toUpperCase() + book[key].substring(1),
									value: book[key],
								},
							},
						};
					}
				} else {
					// Populate input field.
					newFormState = {
						...newFormState,
						[key]: {
							...newFormState[key as keyof bookFormDataType],
							value: book[key],
						},
					};
				}
			}

			setFormData({ ...newFormState });
		}
	}, [book]);

	const outerModalRef = useRef<HTMLDivElement>(null);
	const innerModalRef = useRef<HTMLFormElement>(null);

	useCloseOnOverlayClickOrEsc(modalOpen, setModalOpen, 'modal-overlay');
	useFocusTrap(innerModalRef, modalOpen);

	const { author, title, category, readingMedium, yearRead, status } = formData;

	if (category && category.value) {
		category.value = category.value.map((val) => {
			const color = bookCategories.find(
				(cat) => cat.value.toLowerCase() === val.value.toLowerCase()
			)?.color;

			return {
				...val,
				...(color && { color }),
			};
		});
	}

	const handleSubmit = () => {
		let error = validateForm();

		if (!error) {
			let bookData: editBookReqBodyType = {
				id: book.id,
				index: book.index,
				author: author.value,
				title: title.value,
				yearRead: +yearRead.value,
				category: Array.isArray(category.value)
					? [...category.value]?.map((val) => val.value)
					: [],
				readingMedium: readingMedium?.value?.value,
				lastReadAt: status?.value?.value === 'read' ? new Date().toISOString() : null,
				updatedAt: new Date().toISOString(),
				status: status?.value?.value,
			};

			dispatch(editBook(bookData));
			handleClose();
		}
	};

	const handleClose = () => {
		setEditBookId(null);
		setModalOpen(false);
	};

	const validateForm = (): boolean => {
		let error: boolean = false;
		const allFormFields = { ...formData };

		// Loop over the form data fields.
		Object.keys(formData).forEach((key) => {
			const fieldObj = formData[key as keyof bookFormDataType];
			if (fieldObj.required) {
				// Check if required field is not empty.
				if (
					!fieldObj.value ||
					(Array.isArray(fieldObj.value) && fieldObj.value.length === 0)
				) {
					allFormFields[key as keyof bookFormDataType].error = 'This field is required!';
					error = true;
				} else {
					allFormFields[key as keyof bookFormDataType].error = '';
				}
			}
		});
		setFormData({ ...allFormFields });
		return error;
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const field = e.target.name;
		const value = e.target.value;
		const fieldObj = formData[field as keyof bookFormDataType];

		setFormData((prevState) => ({ ...prevState, [field]: { ...fieldObj, value } }));
	};

	const handleSelectMultiChange = (e: selectItemType[], field: string) => {
		const fieldObj = formData[field as keyof bookFormDataType];

		// Set the value of the selection to lowercase.
		const lowerCasedValues = [...e].map((e) => ({ ...e, value: e.value?.toLowerCase() }));

		setFormData((prevState) => ({
			...prevState,
			[field]: { ...fieldObj, value: lowerCasedValues },
		}));
	};

	const handleSelectChange = (e: selectItemType, field: string) => {
		const fieldObj = formData[field as keyof bookFormDataType];

		// Set the value of the selection to lowercase.
		setFormData((prevState) => ({
			...prevState,
			[field]: { ...fieldObj, value: { ...e, value: e.value?.toLowerCase() } },
		}));
	};

	const handleDelete = () => {
		const confirmation = window.confirm(
			`Are you sure you want to delete "${book.title}" from you list?`
		);

		if (confirmation == true) {
			dispatch(deleteBook(book.id));
			handleClose();
		}
	};

	return (
		<div
			className={`modal-overlay ${modalOpen ? 'show' : ''}`}
			aria-modal={modalOpen ? true : false}
			ref={outerModalRef}
		>
			<form className="modal" ref={innerModalRef} onSubmit={(e) => e.preventDefault()}>
				<button
					className="close-container"
					type="button"
					onClick={handleClose}
					tabIndex={modalOpen ? 0 : -1}
				>
					<RiCloseLine />
				</button>

				<div className="modal-header">
					<h2>Edit Book</h2>
				</div>

				<div className="modal-mody">
					<FormGroup>
						<TextInput
							label="Author"
							name="author"
							placeholder="Enter author name..."
							value={author.value}
							error={author.error}
							required={author.required}
							handleChange={handleChange}
							tabIndex={modalOpen ? 0 : -1}
						/>

						<TextInput
							label="Title"
							name="title"
							placeholder="Enter books title name..."
							value={title.value}
							error={title.error}
							required={title.required}
							handleChange={handleChange}
							tabIndex={modalOpen ? 0 : -1}
						/>
					</FormGroup>

					<FormGroup>
						<SelectInput
							label="Category"
							value={category?.value}
							name="category"
							handleChange={handleSelectMultiChange}
							options={bookCategories}
							placeholder="Select book category..."
							isMulti
							isSearchable
							required={category.required}
							error={category.error}
						/>
					</FormGroup>

					<FormGroup>
						<SelectInput
							label="Reading Medium"
							value={readingMedium?.value}
							name="readingMedium"
							handleChange={handleSelectChange}
							options={bookMediums}
							placeholder="Select reading medium..."
							required={readingMedium.required}
							error={readingMedium.error}
						/>

						<SelectInput
							label="Status"
							value={status?.value}
							name="status"
							handleChange={handleSelectChange}
							options={bookStatuses}
							placeholder="Select book status..."
							required={status.required}
							error={status.error}
						/>
					</FormGroup>

					<FormGroup>
						<TextInput
							label="Year Read / Reading"
							name="yearRead"
							placeholder="Enter year read..."
							value={yearRead.value}
							error={yearRead.error}
							required={yearRead.required}
							handleChange={handleChange}
							tabIndex={modalOpen ? 0 : -1}
							numberInput
						/>
					</FormGroup>
				</div>

				<div className="modal-footer">
					<button
						type="button"
						tabIndex={modalOpen ? 0 : -1}
						className="btn btn-block btn-danger"
						onClick={handleDelete}
					>
						Delete
					</button>

					<button
						tabIndex={modalOpen ? 0 : -1}
						className="btn btn-block"
						onClick={handleSubmit}
					>
						Save
					</button>
				</div>
			</form>
		</div>
	);
};

export default React.memo(EditBookModal);

import { bookCategories } from '../../assets/data/bookSelectValues';

interface CategoryLinkProps {
	category: string;
}

const CategoryLink = ({ category }: CategoryLinkProps) => {
	return (
		<a
			style={{
				backgroundColor: `${
					bookCategories.find((bookCategory) => bookCategory.value === category)?.color ||
					'#fff'
				}26`,
				border: '2px solid #ffffff26',
				padding: '2px 6px',
				borderRadius: '4px',
				textDecoration: 'underline dashed transparent',
			}}
			className="table-book-category"
			href={`https://www.goodreads.com/genres/${category.replaceAll(' ', '-')}`}
			target="_blank"
		>
			{category}
		</a>
	);
};

export default CategoryLink;

import {
	BarElement,
	CategoryScale,
	Chart as ChartJS,
	Legend,
	LinearScale,
	Title,
	Tooltip,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { RootState } from '../../app/store';
import { selectReadBooksByYearByCategory } from '../../features/books/selectors';
import { cssVar } from '../../helpers/getCssVariable';
import { useWindowWidth } from '../../hooks/useWindowWidth';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const BooksReadByYearByCategoryChart = () => {
	const windowWidth = useWindowWidth();
	const { years, datasets } = useSelector((state: RootState) =>
		selectReadBooksByYearByCategory(state)
	);

	const legendMargin = {
		id: 'legendMargin',
		beforeInit(chart: any) {
			const fitValue = chart.legend.fit;
			chart.legend.fit = function fit() {
				fitValue.bind(chart.legend)();
				return (this.height += 8);
			};
		},
	};

	ChartJS.defaults.font.family = cssVar('--font-main');

	const options = {
		interaction: {
			mode: 'index',
		},
		responsive: true,
		indexAxis: windowWidth >= 992 ? ('y' as const) : ('x' as const),
		maintainAspectRatio: false,
		plugins: {
			tooltip: {
				itemSort: (a: any, b: any) => b.raw - a.raw,
				filter: (tooltipItem: any) => tooltipItem.raw > 0,
				callbacks: {
					label: (context: any) => {
						const label = context.dataset.label;
						const value = context.raw;

						const indexOfLabel = context.chart.tooltip.dataPoints.findIndex(
							(e: any) => e.datasetIndex === context.datasetIndex
						);

						return `#${indexOfLabel + 1} – ${label}: ${value}`;
					},
				},
				titleFont: {
					weight: '400',
				},
				bodyFont: {
					weight: '200',
				},
			},
			datalabels: {
				backgroundColor: cssVar('--dark-alt'),
				borderRadius: 3,
				color: cssVar('--light'),
				font: {
					weight: 200,
				},
				padding: {
					bottom: 2,
				},
				// Only show data label if value is above 0.
				display: function (context: any) {
					let index = context.dataIndex;
					let value = context.dataset.data[index];
					return value > 0;
				},
			},
			title: {
				display: true,
				text: 'Read Categories by Year',
				color: cssVar('--light'),
				font: {
					weight: '400',
					size: 18,
				},
			},
			legend: {
				onClick: function (e: any, legendItem: any, legend: any) {
					const index = legendItem.datasetIndex;
					const ci = legend.chart;

					if (ci.isDatasetVisible(index)) {
						ci.hide(index);
						legendItem.hidden = true;
					} else {
						ci.show(index);
						legendItem.hidden = false;
					}

					if (index === 0) {
						ci.data.datasets.forEach((e: any, i: number) => {
							if (i === 0) return;

							if (legendItem.hidden) {
								ci.hide(i);
								e.hidden = true;
							} else {
								ci.show(i);
								e.hidden = false;
							}
						});
					}
				},
				labels: {
					color: cssVar('--light'),
					font: {
						size: 14,
						weight: '200',
					},
				},
			},
		},
		scales: {
			x: {
				stacked: true,
				ticks: {
					color: cssVar('--light'),
					beginAtZero: true,
					display: windowWidth < 992,
					stepSize: 8,
				},
				grid: {
					color: 'transparent',
				},
			},
			y: {
				stacked: true,
				ticks: {
					color: cssVar('--light'),
					beginAtZero: true,
					count: 11,
					display: windowWidth >= 992,
				},
				border: {
					display: false,
				},
				grid: {
					color: cssVar('--light-alt-light'),
					tickLength: 8,
					tickColor: 'transparent',
				},
			},
		},
	};

	const labels = years;

	const data = {
		labels,
		datasets: [
			{ label: 'All categories', data: [], backgroundColor: `${cssVar('--light')}` },
			...datasets,
		],
	};

	const plugins = [legendMargin];

	return (
		<div className="chart-container read-books-by-year-by-category">
			{/* @ts-ignore */}
			<Bar options={options} data={data as any} plugins={plugins} />
		</div>
	);
};

export default BooksReadByYearByCategoryChart;

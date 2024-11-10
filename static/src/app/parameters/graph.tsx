import { getInputContext, getMonthContext } from "@app/data/sample-data";
import { Line as LineGraph } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const lineColors = [
  "#991111",
  "#111199",
  "#119911",
  "#999911",
  "#991199",
  "#119999",
];

export const Graph = ({ monthlyData, inputData, yAxisKey, labels }) => {
  return (
    <div className=" p-4 rounded-xl bg-gray-300 shadow-2xl">
      <LineGraph
        data={{
          datasets: [
            ...monthlyData.map((data, i) => ({
              data,
              parsing: {
                yAxisKey: yAxisKey,
                xAxisKey: "month",
              },
              label: inputData[i].hash,
              backgroundColor: lineColors[i % lineColors.length],
              borderColor: lineColors[i % lineColors.length],
            })),
          ],
          labels,
        }}
      />
    </div>
  );
};

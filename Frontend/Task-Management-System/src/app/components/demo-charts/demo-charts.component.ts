import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

// Chart.js
import { Chart, registerables } from 'chart.js';
// ECharts
import * as echarts from 'echarts';
// Highcharts
import * as Highcharts from 'highcharts';

// Import your service and model
import { TaskService } from '../../services/tasks/task.service';
import { TaskSummaryResponse } from '../../models/task.model';

@Component({
  selector: 'app-demo-charts',
  templateUrl: './demo-charts.component.html',
  styleUrls: ['./demo-charts.component.css']
})
export class DemoChartsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private taskService = inject(TaskService);

  projectId!: string;
  projectName!: string;
  selectedDueDate!: string | null;

  // Hold counts
  statusCounts = { backlog: 0, 'to-do': 0, 'in-progress': 0, done: 0 };
  priorityCounts = { low: 0, medium: 0, high: 0 };

  constructor() {
    Chart.register(...registerables);
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.projectId = params.get('id')!;
      this.loadTasks();
    });
    this.route.queryParamMap.subscribe(query => {
      this.projectName = query.get('projectName') || 'Project';
      this.selectedDueDate = query.get('due');
    });
  }

  loadTasks() {
    this.taskService.getTasksByProject(this.projectId).subscribe(tasks => {
      // Reset counts
      this.statusCounts = { backlog: 0, 'to-do': 0, 'in-progress': 0, done: 0 };
      this.priorityCounts = { low: 0, medium: 0, high: 0 };

      tasks.forEach(t => {
        const s = t.status as keyof typeof this.statusCounts;
        const p = t.priority as keyof typeof this.priorityCounts;

        if (s) this.statusCounts[s]++;
        if (p) this.priorityCounts[p]++;
      });

      console.log('Status counts:', this.statusCounts);
      console.log('Priority counts:', this.priorityCounts);

      // Initialize all charts
      setTimeout(() => {
        this.renderChartJSCharts();
        this.renderECharts();
        this.renderHighcharts();
      }, 0);
    });
  }

  renderChartJSCharts(): void {
    // Doughnut - Task Status
    new Chart('chartjsDoughnut', {
      type: 'doughnut',
      data: {
        labels: ['Backlog', 'To-Do', 'In Progress', 'Done'],
        datasets: [{
          data: [
            this.statusCounts.backlog,
            this.statusCounts['to-do'],
            this.statusCounts['in-progress'],
            this.statusCounts.done
          ],
          backgroundColor: ['#FF6384', '#36A2EB', '#FFCE56', '#4CAF50']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Task Status Overview - Chart.js'
          }
        }
      }
    });

    // Bar - Task Priority
    new Chart('chartjsBar', {
      type: 'bar',
      data: {
        labels: ['Low', 'Medium', 'High'],
        datasets: [{
          label: 'Number of Tasks',
          data: [
            this.priorityCounts.low,
            this.priorityCounts.medium,
            this.priorityCounts.high
          ],
          backgroundColor: ['#8BC34A', '#FFC107', '#F44336']
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Task Priority Distribution - Chart.js'
          }
        }
      }
    });
  }

  renderECharts(): void {
    // Doughnut
    const echartsDoughnut = echarts.init(document.getElementById('echartsDoughnut')!);
    echartsDoughnut.setOption({
      title: { text: 'Task Status Overview - ECharts', left: 'center' },
      tooltip: { trigger: 'item' },
      legend: { bottom: '0%' },
      series: [{
        name: 'Tasks',
        type: 'pie',
        radius: ['40%', '70%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: { label: { show: true, fontSize: '16', fontWeight: 'bold' } },
        labelLine: { show: false },
        data: [
          { value: this.statusCounts.backlog, name: 'Backlog' },
          { value: this.statusCounts['to-do'], name: 'To-Do' },
          { value: this.statusCounts['in-progress'], name: 'In Progress' },
          { value: this.statusCounts.done, name: 'Done' }
        ]
      }]
    });

    // Bar
    const echartsBar = echarts.init(document.getElementById('echartsBar')!);
    echartsBar.setOption({
      title: { text: 'Task Priority Distribution - ECharts', left: 'center' },
      tooltip: {},
      xAxis: { type: 'category', data: ['Low', 'Medium', 'High'] },
      yAxis: { type: 'value' },
      series: [{
        data: [
          this.priorityCounts.low,
          this.priorityCounts.medium,
          this.priorityCounts.high
        ],
        type: 'bar',
        itemStyle: { color: '#5470C6' }
      }]
    });
  }

  renderHighcharts(): void {
    // Doughnut
    Highcharts.chart('highchartsDoughnut', {
      chart: { type: 'pie' },
      title: { text: 'Task Status Overview - Highcharts' },
      plotOptions: {
        pie: {
          innerSize: '50%',
          dataLabels: { enabled: true }
        }
      },
      series: [{
        type: 'pie',
        name: 'Tasks',
        data: [
          ['Backlog', this.statusCounts.backlog],
          ['To-Do', this.statusCounts['to-do']],
          ['In Progress', this.statusCounts['in-progress']],
          ['Done', this.statusCounts.done]
        ]
      }]
    });

    // Bar
    Highcharts.chart('highchartsBar', {
      chart: { type: 'column' },
      title: { text: 'Task Priority Distribution - Highcharts' },
      xAxis: { categories: ['Low', 'Medium', 'High'] },
      yAxis: { title: { text: 'Number of Tasks' } },
      series: [{
        type: 'column',
        name: 'Tasks',
        data: [
          this.priorityCounts.low,
          this.priorityCounts.medium,
          this.priorityCounts.high
        ]
      }]
    });
  }
}

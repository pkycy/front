<template>
    <div class="home-page">
        <div ref="chart" class="chart"></div>
    </div>
</template>



<script lang="ts">

import { onMounted, ref } from 'vue';

import * as echarts from 'echarts/core';
import { PieChart } from 'echarts/charts';
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件
echarts.use([
    PieChart,
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    CanvasRenderer
]);
export default {
    name: 'HomePageTwo',
    setup() {
        const chart = ref<HTMLElement | null>(null);

        onMounted(() => {
            if (chart.value) {
                const myChart = echarts.init(chart.value);
                const option = {
                    title: {
                        text: '部件统计',
                        left: 'center'
                    },
                    tooltip: {
                        trigger: 'item'
                    },
                    legend: {
                        orient: 'vertical',
                        left: 'left'
                    },
                    series: [
                        {
                            name: '订单数量',
                            type: 'pie',
                            radius: '50%',
                            data: [
                                { value: 335, name: '传感器零件' },
                                { value: 310, name: '驱动零件' },
                                { value: 234, name: '执行器零件' },
                                { value: 135, name: '其它辅助零件' },
                                { value: 1548, name: '电器零件' }
                            ],
                            emphasis: {
                                itemStyle: {
                                    shadowBlur: 10,
                                    shadowOffsetX: 0,
                                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                                }
                            }
                        }
                    ]
                };
                myChart.setOption(option);
            }
        });

        return {
            chart
        };
    }

}




</script>

<style lang="less" scoped>
.home-page {
    width: 100%;
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
}

.chart {
    width: 80%;
    height: 80%;
}
</style>
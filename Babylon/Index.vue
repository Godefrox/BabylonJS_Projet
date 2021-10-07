<template>
    <div layout="column" class="fill-viewport" style="overflow-y: auto; overflow-x: hidden;">
        <v-divider></v-divider>
        <div class="fill-viewport" layout="row" style="overflow-y: auto; overflow-x: hidden;">
            <v-navigation-drawer class="fill-viewport"
                                 style="background-color: #fafbfd; width:350px ">
                <v-toolbar flex style="max-height:70px; background-color: #43ABFF">
                    <v-btn @click="setEditionMod" id="buttonEdition"
                           class="">
                        ÉDITION
                    </v-btn>
                    <v-btn @click="setSimulationMod" id="buttonSimulation"
                           class="">
                        SIMULATION
                    </v-btn>
                </v-toolbar>
                <div v-if="editionMod" >
                <div v-for="(niveau, indice) in navDrawerItems" :key="indice">
                    <v-list-item @click="setAction(niveau.id)" :id="niveau.id" link color="primary">
                        <v-list-item-avatar>
                            <v-icon>{{ niveau.icon }}</v-icon>
                        </v-list-item-avatar>

                        <v-list-item-content>
                            <v-list-item-title v-html="niveau.title"></v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </div>
                <v-divider></v-divider>
                    <v-subheader >Nom de la zone</v-subheader>
                    <v-autocomplete
                        auto-select-first
                        clearable
                        dense
                        filled
                        rounded
                        solo
                        :items="listItemsArea"
                        @input="setAreaName"
                        item-color="blue"
                    id="textAreaInput"></v-autocomplete>
                <v-text-field @input="setAccessName($event)" id="textAccessInput"
                              style="margin-right : 10px; margin-left : 10px;" class="areaText"
                              placeholder="Nom du Modèle" filled outlined></v-text-field>
                <v-divider></v-divider>
                <v-color-picker @update:color="setColor($event)"></v-color-picker>
                </div>
                <div v-if="simulationMod">
                    <v-date-picker v-model="dates" range @click:date="getDataDate"></v-date-picker>
                    <div>
                        <v-btn style="padding: 0 !important; margin:0 !important; overflow-y: auto; width : 100%;" :disabled="!dataLoaded || dataLaunch" @click="launchSimulation">
                            <v-icon id="button-Launch">mdi-arrow-right-drop-circle-outline</v-icon>
                            {{ textLaunch }}
                        </v-btn>
                    </div>
                    <br>
                    <div>
                        <v-btn style="padding: 0 !important; margin:0 !important; overflow-y: auto; width : 100%;" :disabled="!dataLaunch" @click="stopSimulation">
                            <v-icon id="button-Stop">mdi-stop-circle-outline</v-icon>
                            {{ textStop }}
                        </v-btn>
                    </div>
                    <v-subheader :disabled="dataLaunch" >Minute</v-subheader>
                    <v-slider :disabled="dataLaunch" @change="setMinuteSimulation" v-model="sliderMinute" :max="maxMinute" :min="minMinute" style="margin:20px" thumb-label="always"></v-slider>
                    <v-subheader>Seconde</v-subheader>
                    <v-slider :disabled="dataLaunch" @change="setSecondSimulation" v-model="sliderSecond" :max="maxSecond" :min="minSecond" style="margin:20px" thumb-label="always"></v-slider>
                </div>
            </v-navigation-drawer>
            <v-divider vertical></v-divider>
            <div style="width: 100%; height: 100%;">
                <canvas style="padding: 0 !important; margin:0 !important; width: 100%; height:90%;" id="renderCanvas"></canvas>
                <div v-if="drawChart && displayChart" id="timeLine"></div>
                <v-btn v-if="drawChart" style=" width : 100%; margin-top: 20px; margin-bottom: 20px;"   color="primary" @click="toggleTimeLine" >
                    <v-icon>{{ iconFmi }}</v-icon>
                    {{textFmi}}
                </v-btn>

            </div>
            <v-divider></v-divider>
        </div>
    </div>
</template>

<script type="module" >
import * as BABYLON from 'babylonjs'
import 'babylonjs-gui'
import Engine from '@/mixins/Engine.js'
import * as earcut from 'earcut'
import areas from '../../api/areaPosition'
import LineChart from '@/components/stats/charts/LineChart.js'
import stat from '../../api/stats'
import SC from '@/utils/stats/consts'
import dateMixins from '@/mixins/date'
import moment from "moment"
import ApexCharts from 'apexcharts'

let objectMe = null

export default {
    components: {
        LineChart
    },
    mixins: [dateMixins],
    data() {
        return {
            navDrawerItems: [
                {
                    title: 'Ajouter un Sommet',
                    icon: 'mdi-plus-thick',
                    id: 'addVertex'

                }, {
                    title: 'Supprimer un Sommet',
                    icon: 'mdi-close-thick',
                    id: 'removeVertex'
                }, {
                    title: 'Modifier un Sommet',
                    icon: 'mdi-cursor-move',
                    id: 'modifyVertex'
                }, {
                    title: 'Déposer un Modèle',
                    icon: 'mdi-drag-variant',
                    id: 'dragDrop'
                }
            ],
            textLaunch: 'Lancer la simulation',
            textStop: 'Stopper la simulation',
            textFmi: 'Voir la fmi',
            iconFmi: 'mdi-chevron-double-down',
            listItemsArea: [],
            visualisation: null,
            editionMod: false,
            dataLoaded: false,
            dataLaunch: false,
            simulationMod: false,
            dates: ['', ''],
            date: {StartDate: '', EndDate: ''},
            chart: null,
            options: {
                series: null,
                chart: {
                    height: '20%',
                    type: 'rangeBar',
                    horizontal: false,
                    events: {
                        click: function (event, chartContext, config) {
                            let Time = event.toElement.dataset
                            let time1 = parseInt(Time.rangeY1)
                            let time2 = parseInt(Time.rangeY2)
                            let d1 = new Date(time1)
                            let d2 = new Date(time2)
                            // UTC TO LOCAL // let d3 = new Date(d1.getUTCFullYear(), d1.getUTCMonth() , d1.getUTCDay() ,  d1.getUTCHours() ,d1.getUTCMinutes())
                            // GET DATE UTC // console.log(d1.getUTCFullYear() + ', ' + d1.getUTCMonth() + ', ' + d1.getUTCDay() + ' ' + )
                            if (objectMe !== undefined && objectMe !== null) {
                                let day1UTC = d1.getUTCHours() + ':' + d1.getUTCMinutes()
                                let day2UTC = d2.getUTCHours() + ':' + d2.getUTCMinutes()
                                objectMe.simulationSet(day1UTC,day2UTC)
                            }
                        }
                    }
                },
                plotOptions: {
                    bar: {
                        horizontal: true,
                        columnWidth: '2%',
                        barHeight: '20%',
                        rangeBarGroupRows: true,
                    }
                },
                colors: [
                    "#ff0000", "#ffbf00", "#73bf31", "#008207",
                    "#775DD0", "#000000"
                ],
                fill: {
                    type: 'solid'
                },
                xaxis: {
                    type: 'datetime',
                    reversed: true
                },
                yaxis: {
                    reversed: true
                },
                legend: {
                    position: 'right'
                }
            },
            drawChart: false,
            displayChart: false,
            mapData: null,
            tabDate: null,
            datesSimulation: null,
            sliderMinute: 2,
            sliderSecond: 0,
            minMinute: 0,
            maxMinute: 59,
            minSecond: 0,
            maxSecond: 59,
        }
    },
    methods: {
        /**
         * Initialise all variables, create engine, take on the babylon JS visualisation
         */
        init() {
            objectMe = this
            this.visualisation = new Engine(this,earcut)
            const me = this.visualisation
            me.earcut = earcut
            BABYLON.earcut = earcut
            me.createDefaultEngine = function () {
                return new BABYLON.Engine(me.canvas, true, {
                    preserveDrawingBuffer: true,
                    stencil: true,
                    disableWebGL2Support: false
                })
            }

            me.initFunction = async function () {
                const asyncEngineCreation = async function () {
                    try {
                        return me.createDefaultEngine()
                    } catch (e) {
                        return me.createDefaultEngine()
                    }
                }

                me.engine = await asyncEngineCreation()
                if (!me.engine) throw 'engine should not be null.'
                me.scene = me.defaultScene()
                me.canvas.addEventListener('wheel', function (event) {
                    me.zoom += event.deltaY * +0.01
                    // Restrict scale
                    me.zoom = Math.min(Math.max(me.minZoom, me.zoom), me.maxZoom)
                    me.resizeCamera()
                })
            }
            me.initFunction().then(() => {
                me.sceneToRender = me.scene
                me.engine.runRenderLoop(function () {
                    if (me.sceneToRender && me.sceneToRender.activeCamera) {
                        me.sceneToRender.render()
                    }
                })
                this.loadArea()
            })
            // Resize
            window.addEventListener('resize', function () {
                me.engine.resize()
            })
            document.getElementById('renderCanvas').engine = me
        },
        /**
         * Set the color of actual object chosen. Use by Color Picker
         */
        setColor(event) {
            if (this.visualisation !== null && this.visualisation !== undefined) {
                this.visualisation.setColor(event)
            }
        },
        /**
         * Set the interface and camera in edition mod
         */
        setEditionMod() {
            const bool = !this.editionMod
            let me = this
            me.setAllModFalse()
            setTimeout(function () {
                me.editionMod = bool
                if (me.visualisation !== undefined && me.visualisation !== null) {
                    me.visualisation.setCameraType((me.editionMod) ? 'edition' : 'normal')
                    me.resizeCamera()
                }
            }, 100)
        },
        /**
         * Set the interface and camera in Simulation mod
         */
        setSimulationMod() {
            const bool = !this.simulationMod
            let me = this
            me.setAllModFalse()
            setTimeout(function () {
                me.simulationMod = bool
                if (me.visualisation !== undefined && me.visualisation !== null) {
                    me.visualisation.setCameraType((me.simulationMod) ? 'simulation' : 'normal')
                    me.resizeCamera()
                }
            }, 100)
        },
        /**
         * Set all the mod of camera in false
         * Actually only two mod, but in future you juste need to put her the mod you want to add
         */
        setAllModFalse() {
            this.editionMod = false
            this.simulationMod = false
        },
        /**
         * Resize the camera of babylon, necessary when the interface change
         */
        resizeCamera() {
            const me = this
            me.$nextTick(() => {
                setTimeout(() => {
                    me.visualisation.engine.resize()
                    me.visualisation.resizeCamera()
                }, 0)
            })
        },
        /**
         * Set the action you want to made
         */
        setAction(actionName) {
            this.visualisation.setAction(actionName)
        },
        /**
         * Set the current area you want to modify
         */
        setAreaName(areaName) {
            this.visualisation.setAreaName(areaName)
        },
        /**
         * Set the current access you want to modify
         */
        setAccessName(accesName) {
            this.visualisation.setAccessName(accesName)
        },
        /**
         * Allow to load all Area in database
         */
        loadArea() {
            this.listItemsArea = []
            areas.getAreasPosition().then(res => {
                const tab = res.data
                if (this.visualisation !== undefined && this.visualisation !== null) {
                    const map = this.visualisation.getMapArea()
                    let path = null
                    tab.forEach(e => {
                        path = []
                        if (e.Positions !== undefined && e.Positions !== null) {
                            e.Positions.forEach(vector => {
                                path.push(new BABYLON.Vector3(vector.X, vector.Y, vector.Z))
                            })
                        }
                        e.Color = new BABYLON.Color3(e.Color.R, e.Color.G, e.Color.B)
                        e.Positions = path
                        this.visualisation.edition.refreshArea(e)
                        map.set(e.AreaName, e)
                        this.listItemsArea.push(e.AreaName)
                    })
                }
            })
        },
        /**
         * Allow to launch simulation
         */
        launchSimulation() {
            this.dataLaunch = true
            this.visualisation.launchSimulation(this, this.mapData, this.datesSimulation, this.tabDate)
        },
        /**
         * Allow to stop simulation
         */
        stopSimulation() {
            this.dataLaunch = false
            this.visualisation.simulation.stopSimulation()
        },
        /**
         * verify before to get data, if the date has ordered
         */
        getDataDate() {
            if (this.dates.length >= 2) {
                const Array1 = this.dates[0].split('-')
                const Array2 = this.dates[1].split('-')
                let i = 0
                while (parseInt(Array1[i]) >= parseInt(Array2[i]) && i < 3) {
                    i++
                }
                if (i === 3) {
                    this.date.StartDate = this.dates[1]
                    this.date.EndDate = this.dates[0]
                } else {
                    this.date.StartDate = this.dates[0]
                    this.date.EndDate = this.dates[1]
                }
                this.statAreaPassing(this.date.StartDate, this.date.EndDate)
            }
        },
        /**
         * This function allowed to load all stat in period
         * @param dateIn
         * @param dateOut
         */
        statAreaPassing(dateIn, dateOut) {

            let dateFrom = moment(dateIn)
            let dateTo = moment(dateOut)
            let nbDays = dateTo.diff(dateFrom, 'days') + 1
            let dates = null
            let me = this

            const filtersParams = {
                DateModeChoisi: SC.DateModeChosen.BY_AREA,
                FrequentationsDuPicker: dateFrom.format('DD/MM/YYYY'),
                FrequentationsAuPicker: dateTo.format('DD/MM/YYYY'),
            }
            let loadSuccess = false
            let load = true
            const func = function (i) {
                setTimeout(function () {
                    me.textLaunch = 'Chargement '
                    for (let k = 0; k < i; k++) {
                        me.textLaunch += '.'
                    }
                    if (load) {
                        if (++i > 3) {
                            i = 1
                        }
                        func(i)
                    } else {
                        if (loadSuccess) {
                            me.textLaunch = 'Lancer la Simulation'
                        } else {
                            me.textLaunch = 'Aucune données'
                        }
                    }
                }, 300)
            }
            func(1)

            let tabDate = filtersParams.FrequentationsDuPicker.split('/')
            let areas = null

            if (this.visualisation !== undefined && this.visualisation !== null) {
                areas = this.visualisation.getMapArea() // LIST OF AREA
            }
            if (areas !== undefined && areas !== null) {
                let size = areas.size + 1
                let pos = 0
                let mapData = new Map()
                let series = [
                    {
                        name: 'FMI HAUTE',
                        data: []
                    },
                    {
                        name: 'FMI MOYENNE',
                        data: []
                    },
                    {
                        name: 'FMI BASSE',
                        data: []
                    },
                    {
                        name: 'FMI TRES BASSE',
                        data: []
                    },
                    {
                        name: 'Aucune Données',
                        data: []
                    },
                    {
                        name: 'Selecteur',
                        data: []
                    }
                ]

                let needDate = false
                let needForce = false
                let trueDate = []
                me.dataLoaded = false

                let getStat = function (iterator, filtersParams) {

                    let name = 'General'

                    if (pos !== 0) {
                        name = iterator.next().value
                        filtersParams.Areas = [areas.get(name).AreaID]
                    }

                    stat.getStatsPassingsFrequentations(filtersParams).then(res => {

                        const PassingTypes = res.data.PassingTypes
                        const Passings = res.data.Passings
                        const myFmi = []

                        if (dates === null) {
                            if (res.data.Dates !== undefined && res.data.Dates !== null) {
                                dates = res.data.Dates
                                needDate = true
                            }
                        }

                        if (PassingTypes.includes('Entrées') && PassingTypes.includes('Sorties')) {


                            let cumIn = 0
                            let cumOut = 0
                            let max = 0

                            for (let i = 0; i < Passings.Entrées.length; ++i) {
                                cumIn += Passings.Entrées[i]
                                cumOut += Passings.Sorties[i]
                                let fmi = Math.ceil((cumIn - cumOut) / nbDays)
                                myFmi.push(fmi)
                                max = Math.max(max, fmi)
                            }

                            let i = 0
                            let oldNum = -1
                            let oldHour = null
                            let oldEndHour = null
                            let forced = false
                            let need = false
                            let num = 0
                            myFmi.forEach(e => {

                                if (!forced) {
                                    let myPercent = (e * 100) / max
                                    let hour = dates[i++].split(':')
                                    let sHour = parseInt(hour[0])
                                    let sMin = parseInt(hour[1])

                                    if (parseInt(hour[1]) === 55) {
                                        if (sHour === 23) {
                                            sHour = 23
                                            sMin = 55
                                            forced = true
                                        } else {
                                            sHour += 1
                                            sMin = 0
                                        }
                                    } else {
                                        sMin += 5
                                    }

                                    if (max > 0 && cumIn > 0/* && cumOut > 0*/) {
                                        if (myPercent < 26) {
                                            num = 3
                                        } else if (myPercent < 51) {
                                            num = 2
                                        } else if (myPercent < 76) {
                                            num = 1
                                        } else if (myPercent <= 100) {
                                            num = 0
                                        }else{
                                            num = 4
                                        }
                                    } else {
                                        num = 4
                                    }

                                    if (num !== oldNum) {
                                        if (need) {
                                            if (needForce) {
                                                series[oldNum].data.unshift({
                                                    x: name,
                                                    y: [
                                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(oldHour[0]), parseInt(oldHour[1]))).getTime(),
                                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), oldEndHour[0], oldEndHour[1])).getTime()
                                                    ]
                                                })
                                            } else {
                                                series[oldNum].data.push({
                                                    x: name,
                                                    y: [
                                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(oldHour[0]), parseInt(oldHour[1]))).getTime(),
                                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), oldEndHour[0], oldEndHour[1])).getTime()
                                                    ]
                                                })
                                                if (forced) {
                                                    needForce = true
                                                }
                                            }
                                            need = false
                                        }
                                        if (needForce) {
                                            series[num].data.unshift({
                                                x: name,
                                                y: [
                                                    new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(hour[0]), parseInt(hour[1]))).getTime(),
                                                    new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), sHour, sMin)).getTime()
                                                ]
                                            })
                                        } else {
                                            series[num].data.push({
                                                x: name,
                                                y: [
                                                    new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(hour[0]), parseInt(hour[1]))).getTime(),
                                                    new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), sHour, sMin)).getTime()
                                                ]
                                            })
                                        }
                                        oldNum = num
                                        oldHour = hour

                                    } else {
                                        need = true
                                    }

                                    oldEndHour = [sHour, sMin]

                                }
                            })

                            if (need) {
                                series[oldNum].data.push({
                                    x: name,
                                    y: [
                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(oldHour[0]), parseInt(oldHour[1]))).getTime(),
                                        new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), oldEndHour[0], oldEndHour[1])).getTime()
                                    ]
                                })
                            }

                        }

                        let stop = false

                        if (needDate) {
                            dates.forEach(e => {
                                if (!stop) {
                                    trueDate.push(e)
                                    let hour = e.split(':')
                                    if (parseInt(hour[1]) === 55) {
                                        if (parseInt(hour[0]) === 23) {
                                            stop = true
                                        }
                                    }
                                }
                            })
                            needDate = false
                        }

                        mapData.set(name, myFmi)
                        pos++

                        if (pos === size) {
                            load = false
                            if (dates !== null) {
                                me.drawChart = true
                                loadSuccess = true
                                me.dataLoaded = true
                                me.options.series = series
                                me.mapData = mapData
                                me.datesSimulation = dates
                                me.tabDate = tabDate
                                if(me.displayChart === true){
                                    if(me.chart !== undefined && me.chart !== null && me.options !== undefined && me.options !== null){
                                            me.chart.updateSeries(me.options.series)
                                    }
                                }
                            }
                        } else {
                            getStat(iterator, filtersParams)
                        }
                    })
                }


                let keys = areas.keys()
                getStat(keys, filtersParams)

            }
        },
        /**
         * Basic function to create chart
         */
        createChart() {
            this.chart = new ApexCharts(document.querySelector("#timeLine"), this.options)
            this.chart.render()
        },
        /**
         * Display or not the timeline. All depend if timeline are already display
         */
        toggleTimeLine() {
            let me = this
            me.displayChart = !this.displayChart
            if(me.displayChart){
                me.textFmi = 'Masquer la fmi'
                me.iconFmi = 'mdi-chevron-double-up'
            }else{
                me.textFmi = 'Voir la fmi'
                me.iconFmi = 'mdi-chevron-double-down'
            }
            setTimeout(function () {
                if (me.displayChart) {
                    me.createChart()
                }
            }, 50)

        },
        /**
         * Set the position of selector in timeline. Allow to change the simulation at specific date
         * @param startDate
         * @param lastDate
         */
        simulationSet(startDate,lastDate) {
            if(this.visualisation !== undefined && this.visualisation !== null) {
                console.log(index)
                let index = this.datesSimulation.indexOf(startDate)
                this.visualisation.simulationSet(this.tabDate,startDate, lastDate,this.mapData,index)
            }
        },
        /**
         * Set minutes of simulation Playing
         * @param event
         */
        setMinuteSimulation(event){

            if(event > 0){
                this.minSecond = 0
            }else{
                this.setSecondSimulation(30)
                this.minSecond = 30
            }

            if(this.visualisation !== undefined && this.visualisation !== null) {
                this.visualisation.simulation.setMinute(event)
            }
        },
        /**
         * Set Second of simulation Playing
         * @param event
         */
        setSecondSimulation(event){
            if(this.visualisation != undefined && this.visualisation != null) {
                this.visualisation.simulation.setSecond(event)
            }
        }
    },
    mounted() {
        this.init()
    }

}
</script>

<style>
#buttonEdition {
    margin-right: 10px;
}

#buttonSimulation {

    margin-left: 10px;
    margin-right: 10px;
}

#button-Stop, #button-Launch {
    margin-right: 5px;
}

</style>

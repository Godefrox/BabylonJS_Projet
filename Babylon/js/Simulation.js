/**
 @Author : Godefroy MONTONATI
 @Module : Visualisation 3D
 */

export default class Simulation {

    engine = null;
    simulationOnPlay = false;
    time = [2,0]

    constructor(engine) {
        this.engine = engine
    }

    /**
     * Allow to launch Simulation
     * @param core represent the javascript object of Vue Page. It was necessary when you want to modify chart.
     * @param mapData
     * @param dates
     * @param tabDate
     */
    launchSimulation(core, mapData, dates, tabDate) {
        let areas = null;
        if (this.engine !== undefined && this.engine !== null) {
            areas = this.engine.getMapArea() // LIST OF AREA
        }
        let size = areas.size + 1
        let me = this

        let maxMapArea = new Map()

        areas.forEach(e => {

            let max = -1;
            let datas = mapData.get(e.AreaName)

            datas.forEach(fmi => {
                max = Math.max(fmi, max)
            })

            maxMapArea.set(e.AreaName, max)
        })

        let nbLoop = mapData.get('General').length
        let time = ((this.time[0]*60)+this.time[1])*1000
        let timeLoop = 0
        let timeLoopRefresh = nbLoop / (time / 1000)
        let stop = false;
        let func = function (i) {
            setTimeout(function () {
                let hour = dates[i].split(':')
                let sHour = parseInt(hour[0])
                let sMin = parseInt(hour[1])
                if (parseInt(hour[1]) === 55) {
                    if (sHour === 23) {
                        sHour = 0
                        sMin = 0
                        stop = true;
                    } else {
                        sHour += 1
                        sMin = 0
                    }
                } else {
                    sMin += 5
                }
                if (!stop) {
                    areas.forEach(area => {
                        let color = me.getPersonalColor((mapData.get(area.AreaName)[i]), maxMapArea.get(area.AreaName))
                        me.executionArea(area, color)
                    })

                    if (core.chart !== undefined && core.chart !== null && timeLoopRefresh <= timeLoop) {

                        let name = 'General'
                        let keys = areas.keys()
                        core.options.series[core.options.series.length - 1].data.length = 0
                        for (let pos = 0; pos < size; pos++) {
                            if (pos !== 0) {
                                name = keys.next().value
                            }
                            core.options.series[core.options.series.length - 1].data.push(
                                me.addSeries(tabDate, name, hour, [sHour, sMin])
                            )
                        }
                        core.chart.updateSeries(core.options.series)
                        timeLoop = 0
                    }
                    if (++i < nbLoop && me.simulationOnPlay === true) {
                        timeLoop++
                        func(i)
                    }else{
                        me.simulationOnPlay = false
                        core.dataLaunch = false
                    }
                }else{
                    me.simulationOnPlay = false
                    core.dataLaunch = false
                }
            }, time / nbLoop)
        }
        this.simulationOnPlay = true
        func(0)
    }

    /**
     * Get Personal Color, all color has been set on the color of Chart
     * @param data
     * @param fmiMax
     * @returns {BABYLON.Color3}
     */
    getPersonalColor(data, fmiMax) {
        let myPercent = (data * 100) / fmiMax
        let color = new BABYLON.Color3(0, 1, 0)
        if (myPercent < 26) {

        } else if (myPercent < 51) {
            color.g = 0.75
            color.r = 0.45
        } else if (myPercent < 76) {
            color.r = 1
            color.g = 0.75
        } else if (myPercent <= 100) {
            color.r = 1
            color.g = 0
        } else {
            color.r = 0.46
            color.g = 0.36
            color.b = 0.81
        }
        return color
    }

    /**
     * Set the color of actual area. Do not use the refreshArea function, the default color of area do not change
     * in the simulation. Only the color of ExtrudePolygon
     * @param area
     * @param color
     */
    executionArea(area, color) {
        if (area.line !== undefined) {
            area.line.dispose()
        }
        if (area.Positions.length >= 2) {
            if (area.polygon != undefined) {
                area.polygon.dispose()
            }

            if (area.Positions.length >= 3) {
                area.polygon = BABYLON.MeshBuilder.ExtrudePolygon('polygon', {
                    shape: area.Positions,
                    depth: 5
                }, this.engine.scene, this.engine.earcut)

                area.polygon.position.y = 5.2
                area.polygon.material = new BABYLON.StandardMaterial('red', this.engine.scene)
                area.polygon.material.alpha = 0.6
                if (color === undefined || color === null) {
                    color = new BABYLON.Color3(Math.random(), Math.random(), Math.random())
                }
                area.polygon.material.diffuseColor = color
                area.polygon.material.backFaceCulling = false
            }
        }
    }

    /**
     * Allow to stop simulation, when she turn
     */
    stopSimulation() {
        this.simulationOnPlay = false
    }

    /**
     * Allow to set à specific time in the timeLine
     * @param startDate
     * @param lastDate
     */
    simulationSet(tabDate, startDate, lastDate, mapData, index) {
        let areas = null;
        if (this.engine !== undefined && this.engine !== null) {
            areas = this.engine.getMapArea() // LIST OF AREA
        }
        let size = areas.size + 1

        let maxMapArea = new Map()
        areas.forEach(e => {

            let max = -1;
            let datas = mapData.get(e.AreaName)

            datas.forEach(fmi => {
                max = Math.max(fmi, max)
            })
            maxMapArea.set(e.AreaName, max)
        })
        let me = this
        areas.forEach(area => {
            let color = me.getPersonalColor((mapData.get(area.AreaName)[index]), maxMapArea.get(area.AreaName))
            me.executionArea(area, color)
        })

        if (core.chart !== undefined && core.chart !== null) {
            let name = 'General'
            let keys = areas.keys()
            core.options.series[core.options.series.length - 1].data.length = 0
            for (let pos = 0; pos < size; pos++) {
                if (pos !== 0) {
                    name = keys.next().value
                }
                core.options.series[core.options.series.length - 1].data.push(
                    me.addSeries(tabDate, name, startDate.split(':'), lastDate.split(':'))
                )
            }
            core.chart.updateSeries(core.options.series)
        }
    }

    /**
     * Allow to add new data in specific categories. We need the exemple of date in table.
     * @param tabDate => [0] === DAY, [1] === MONTH, [2] === YEARS
     * @param name => categories name
     * @param dateFrom  => [0] === HOUR, [1] === MIN in Local Date
     * @param dateTo => [0] === HOUR, [1] === MIN in Local Date
     * @returns object => {x,y}
     */
    addSeries(tabDate, name, dateFrom, dateTo) {
        return {
            x: name,
            y: [
                new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), parseInt(dateFrom[0]), parseInt(dateFrom[1]))).getTime(),
                new Date(Date.UTC(parseInt(tabDate[2]), parseInt(tabDate[1]), parseInt(tabDate[0]), dateTo[0], dateTo[1])).getTime()
            ]
        }
    }

    /**
     * Allow to modify the time minutes in simulation mod
     * @param min
     */
    setMinute(min){
        if(typeof min === "number") {
            this.time[0] = min
        }
    }

    /**
     * Allow to modify the time seconds in simulation mod
     * @param sec
     */
    setSecond(sec){
        if(typeof sec === "number") {
            this.time[1] = sec
        }
    }
}



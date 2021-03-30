window.ClusterDetailsGauge = {
    recommendedConsumption: null,
    hand: null,
    label: null,
    label2: null,

    grades: null,

    maxWateringRatio: 2,

    fromRatio: function(ratio) {
        return ratio * this.recommendedConsumption
    },

    setGrades: function() {
        this.grades = [
            {
                title: window.MESSAGES.dry,
                color: "#ee1f25",
                lowScore: 0,
                highScore: this.fromRatio(0.5)
            },
            {
                title: window.MESSAGES.reduced,
                color: "#f3eb0c",
                lowScore: this.fromRatio(0.5),
                highScore: this.fromRatio(0.8)
            },
            {
                title: window.MESSAGES.recommended,
                color: "#54b947",
                lowScore: this.fromRatio(0.8),
                highScore: this.fromRatio(1.1)
            },
            {
                title: window.MESSAGES.excessive,
                color: "#f3eb0c",
                lowScore: this.fromRatio(1.1),
                highScore: this.fromRatio(1.5)
            },
            {
                title: window.MESSAGES.overwhelming,
                color: "#ee1f25",
                lowScore: this.fromRatio(1.5),
                highScore: this.fromRatio(this.maxWateringRatio)
            }
        ];

        return this.grades
    },

    lookUpGrade: function(lookupScore) {
        // Only change code below this line
        for (var i = 0; i < this.grades.length; i++) {
            if (
                this.grades[i].lowScore < lookupScore &&
                this.grades[i].highScore >= lookupScore
            ) {
                return this.grades[i];
            }
        }
        return null;
    },

    initialize: function(recommendedConsumption) {
        // set recommended
        this.recommendedConsumption = recommendedConsumption;

        // Themes begin
        am4core.useTheme(am4themes_animated);
        // Themes end

        var chartMin = 0;
        var chartMax = 2*recommendedConsumption;

        var data = {
            score: 0.001,
            gradingData: this.setGrades()
        };

        /**
         Grading Lookup
         */

        // create chart
        var chart = am4core.create("cluster-details-gauge-container", am4charts.GaugeChart);
        chart.hiddenState.properties.opacity = 0;
        chart.fontSize = 11;
        chart.innerRadius = am4core.percent(80);
        chart.resizable = true;

        /**
         * Normal axis
         */

        var axis = chart.xAxes.push(new am4charts.ValueAxis());
        axis.min = chartMin;
        axis.max = chartMax;
        axis.strictMinMax = true;
        axis.renderer.radius = am4core.percent(80);
        axis.renderer.inside = true;
        axis.renderer.line.strokeOpacity = 0.1;
        axis.renderer.ticks.template.disabled = false;
        axis.renderer.ticks.template.strokeOpacity = 1;
        axis.renderer.ticks.template.strokeWidth = 0.5;
        axis.renderer.ticks.template.length = 5;
        axis.renderer.grid.template.disabled = true;
        axis.renderer.labels.template.radius = am4core.percent(15);
        axis.renderer.labels.template.fontSize = "0.9em";

        /**
         * Axis for ranges
         */

        var axis2 = chart.xAxes.push(new am4charts.ValueAxis());
        axis2.min = chartMin;
        axis2.max = chartMax;
        axis2.strictMinMax = true;
        axis2.renderer.labels.template.disabled = true;
        axis2.renderer.ticks.template.disabled = true;
        axis2.renderer.grid.template.disabled = false;
        axis2.renderer.grid.template.opacity = 0.5;
        axis2.renderer.labels.template.bent = true;
        axis2.renderer.labels.template.fill = am4core.color("#000");
        axis2.renderer.labels.template.fontWeight = "bold";
        axis2.renderer.labels.template.fillOpacity = 0.3;


        /**
         Ranges
         */

        for (let grading of data.gradingData) {
            var range = axis2.axisRanges.create();
            range.axisFill.fill = am4core.color(grading.color);
            range.axisFill.fillOpacity = 0.8;
            range.axisFill.zIndex = -1;
            range.value = grading.lowScore > chartMin ? grading.lowScore : chartMin;
            range.endValue = grading.highScore < chartMax ? grading.highScore : chartMax;
            range.grid.strokeOpacity = 0;
            range.stroke = am4core.color(grading.color).lighten(-0.1);
            range.label.inside = true;
            range.label.text = grading.title.toUpperCase();
            range.label.inside = true;
            range.label.location = 0.5;
            range.label.inside = true;
            range.label.radius = am4core.percent(10);
            range.label.paddingBottom = -5; // ~half font size
            range.label.fontSize = "0.9em";
        }

        var matchingGrade = this.lookUpGrade(data.score);

        /**
         * Label 1
         */

        var label = chart.radarContainer.createChild(am4core.Label);
        label.isMeasured = false;
        label.fontSize = "6em";
        label.x = am4core.percent(50);
        label.paddingBottom = 15;
        label.horizontalCenter = "middle";
        label.verticalCenter = "bottom";
        //label.dataItem = data;
        label.text = data.score.toFixed(1);
        //label.text = "{score}";
        label.fill = am4core.color(matchingGrade.color);

        /**
         * Label 2
         */

        var label2 = chart.radarContainer.createChild(am4core.Label);
        label2.isMeasured = false;
        label2.fontSize = "2em";
        label2.horizontalCenter = "middle";
        label2.verticalCenter = "bottom";
        label2.text = matchingGrade.title.toUpperCase();
        label2.fill = am4core.color(matchingGrade.color);


        /**
         * Hand
         */

        var hand = chart.hands.push(new am4charts.ClockHand());
        hand.axis = axis2;
        hand.innerRadius = am4core.percent(55);
        hand.startWidth = 8;
        hand.pin.disabled = true;
        hand.value = data.score;
        hand.fill = am4core.color("#444");
        hand.stroke = am4core.color("#000");

        // keep ref to hand & labels
        this.hand = hand;
        this.label = label;
        this.label2 = label2;
    },

    setLabel: function(value, normalizedValue) {
        this.label.text = value.toFixed(2);
        const matchingGrade = this.lookUpGrade(normalizedValue);
        this.label2.text = matchingGrade.title.toUpperCase();
        this.label2.fill = am4core.color(matchingGrade.color);
        this.label2.stroke = am4core.color(matchingGrade.color);
        this.label.fill = am4core.color(matchingGrade.color);
    },

    setValue: function(value) {
        if (!this.hand) {
            return
        }

        // set hand to normalized value
        // between 0 and 2*recommended
        const normalizedValue = Math.max(
            Math.min(value, this.fromRatio(2)),
            0
        );

        // set hand to normalized position
        this.hand.showValue(
            normalizedValue,
            1000,
            am4core.ease.cubicOut
        );

        // set label to actual value
        this.setLabel(value, normalizedValue);
    }
};

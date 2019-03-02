//Filtro do IGPM
let filterStart = 7;
let filterEnd = 12;

//Meses do ano
let months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

//Índices do IGPM
let igpm = {
    "2017": [0.64, 0.08, 0.01, -1.1, -0.93, -0.67, -0.72, 0.1, 0.47, 0.2, 0.52, 0.89],
    "2018": [0.76, 0.07, 0.64, 0.57, 1.38, 1.87, 0.51, 0.7, 1.52, 0.89, -0.49, -1.08]
};

//Cores
var colors = {
    red: 'rgb(255, 99, 132)',
    orange: 'rgb(255, 159, 64)',
    yellow: 'rgb(255, 205, 86)',
    green: 'rgb(75, 192, 192)',
    blue: 'rgb(54, 162, 235)',
    purple: 'rgb(153, 102, 255)',
    grey: 'rgb(201, 203, 207)'
};

//Preparando dados do IGPM
function prepareIgpm(startDate, endDate) {
    let igpmData = [];

    //Converte as datas para inteiro
    startDate = parseInt(startDate);
    endDate = parseInt(endDate);

    //Realiza verificações nas datas
    if (isNaN(startDate) || startDate < 1 || startDate > 12) {
        alert("A data inicial é inválida");
    } else if (isNaN(endDate) || endDate < 1 || endDate > 12) {
        alert("A data final é inválida");
    } else if (startDate > endDate) {
        alert("A data inicial não deve ser maior que a data final");
    } else {

        //percorrendos os meses selecionados
        for (let i = startDate - 1; i < endDate; i++) {

            //Calculando e preparando a exbição da diferença entre 2017 e 2018
            let igpmCalc = ((igpm["2018"][i] - igpm["2017"][i]) / igpm["2017"][i]) * 100;
            let igpmToShow = "<span class='" + ((igpmCalc < 0) ? "text-danger" : "text-success") + "'>" + igpmCalc.toFixed(2).replace(".", ",") + "%</span>";

            //Adicionando o ítem ao array
            igpmData.push([months[i], igpm["2017"][i].toFixed(2).replace(".", ","), igpm["2018"][i].toFixed(2).replace(".", ","), igpmToShow]);
        }
    }

    return igpmData;
}


function prepareIgpmDiff() {
    let diff = [];

    for (let i = filterStart - 1; i <= filterEnd - 1; i++) {
        diff.push((igpm["2018"][i] - igpm["2017"][i]).toFixed(2));
    }

    return diff;
}

$(document).ready(function () {

    //Populando as listas de datas
    $(".changeStart, .changeEnd").html(months.map(function (m, i) {
        return "<option value='" + (i + 1) + "'>" + m + "</option>";
    }).join(""));

    //Selecionando as datas iniciais
    $(".changeStart option[value='" + filterStart + "']").prop('selected', true);
    $(".changeEnd option[value='" + filterEnd + "']").prop('selected', true);

    //Aplicando o DataTable
    var table = $('#igpmData').DataTable({
        data: prepareIgpm(filterStart, filterEnd),
        paging: false,
        ordering: false,
        columns: [{
                title: "Mês"
            },
            {
                title: "Índice em 2017"
            },
            {
                title: "Índice em 2018"
            },
            {
                title: "Diferença em %;"
            }
        ],
        language: {
            url: 'src/json/datatables-portuguese-brasil.json'
        }
    });

    //Preparando o gráfico de comparação de índices
    var cIndices = $(".chartIndices");
    var cIndicesChart;
    var cIndicesStart = function () {
        if (cIndices.length > 0) {
            var cIndicesConfig = {
                type: "bar",
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    tooltips: {
                        mode: 'index',
                        intersect: false
                    },
                    hover: {
                        mode: 'nearest',
                        intersect: true
                    },
                    scales: {
                        xAxes: [{
                            display: true
                        }],
                        yAxes: [{
                            display: true
                        }]
                    }
                },
                data: {
                    labels: months.slice(filterStart - 1, filterEnd),
                    datasets: [{
                        label: 'Índice em 2017',
                        backgroundColor: colors.green,
                        borderColor: colors.green,
                        fill: false,
                        data: igpm["2017"].slice(filterStart - 1, filterEnd)
                    }, {
                        label: 'Índice em 2018',
                        backgroundColor: colors.blue,
                        borderColor: colors.blue,
                        fill: false,
                        data: igpm["2018"].slice(filterStart - 1, filterEnd)
                    }, {
                        label: 'Diferença',
                        backgroundColor: colors.red,
                        borderColor: colors.red,
                        fill: false,
                        data: prepareIgpmDiff()
                    }]
                }
            };
            cIndicesChart = new Chart(cIndices, cIndicesConfig);
        }
    };
    cIndicesStart();

    //Aplicando filtro com base nos meses selecionados
    $("body").on('click', ".btnFilter", function () {

        //Atualizando valores do filtro
        filterStart = parseInt($("select[name='start']").val());
        filterEnd = parseInt($("select[name='end']").val());

        //Atualizando itens da tabela
        table.clear().rows.add(prepareIgpm(filterStart, filterEnd)).draw();

        //Atualizando gráfico
        cIndicesChart.destroy();
        cIndicesStart();

        return false;
    });
});
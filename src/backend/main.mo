import Text "mo:core/Text";
import Map "mo:core/Map";
import Array "mo:core/Array";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";

actor {
  type Kpi = {
    name : Text;
    value : Float;
    unit : Text;
    trend : Float;
    status : Text;
  };

  type ChartDataPoint = {
    day : Nat;
    value : Float;
  };

  type SummaryStats = {
    totalProductionToday : Float;
    oee : Float;
    recovery : Float;
    energyCostPerKg : Float;
    activePressCount : Nat;
    breakdownHours : Float;
  };

  type PressData = {
    pressName : Text;
    output : Float;
    oee : Float;
    recovery : Float;
    status : Text;
  };

  type DefectData = {
    defectType : Text;
    count : Nat;
    percentage : Float;
  };

  type MaintenanceEvent = {
    equipmentName : Text;
    eventType : Text;
    duration : Float;
    status : Text;
  };

  type ShiftSummary = {
    shiftName : Text;
    output : Float;
    oee : Float;
    recovery : Float;
  };

  let kpiData = Map.empty<Text, [Kpi]>();

  public shared ({ caller }) func initializeMockData() : async () {
    let ownerKpis = [
      {
        name = "Total Production";
        value = 1250.5;
        unit = "MT";
        trend = 2.5;
        status = "good";
      },
      {
        name = "OEE";
        value = 85.2;
        unit = "%";
        trend = -1.2;
        status = "warning";
      },
      {
        name = "Recovery";
        value = 93.4;
        unit = "%";
        trend = 0.8;
        status = "good";
      },
    ];

    let plantHeadKpis = [
      {
        name = "Total Production";
        value = 1250.5;
        unit = "MT";
        trend = 2.5;
        status = "good";
      },
      {
        name = "OEE";
        value = 85.2;
        unit = "%";
        trend = -1.2;
        status = "warning";
      },
      {
        name = "Recovery";
        value = 93.4;
        unit = "%";
        trend = 0.8;
        status = "good";
      },
      {
        name = "Energy Per Kg";
        value = 1.32;
        unit = "kWh/kg";
        trend = -0.3;
        status = "good";
      },
      {
        name = "Breakdown Hours";
        value = 5.2;
        unit = "hours";
        trend = -0.5;
        status = "good";
      },
    ];

    let productionManagerKpis = [
      {
        name = "Total Production";
        value = 1250.5;
        unit = "MT";
        trend = 2.5;
        status = "good";
      },
      {
        name = "Recovery";
        value = 93.4;
        unit = "%";
        trend = 0.8;
        status = "good";
      },
      {
        name = "Top Press Output";
        value = 400.0;
        unit = "MT";
        trend = 1.5;
        status = "good";
      },
    ];

    kpiData.add("Owner", ownerKpis);
    kpiData.add("PlantHead", plantHeadKpis);
    kpiData.add("ProductionManager", productionManagerKpis);
  };

  public type TimePeriod = {
    #today;
    #monthToDate;
    #yearToDate;
  };

  public query ({ caller }) func getKpisForDashboard(dashboard : Text, period : TimePeriod) : async [Kpi] {
    switch (kpiData.get(dashboard)) {
      case (null) { Runtime.trap("No KPIs found for dashboard: " # dashboard) };
      case (?kpis) { kpis };
    };
  };

  public query ({ caller }) func getChartData(chartType : Text) : async [ChartDataPoint] {
    switch (chartType) {
      case ("production") {
        Array.tabulate(30, func(i) { { day = i + 1; value = 40.0 + (i.toFloat() * 1.2) } });
      };
      case ("recovery") {
        Array.tabulate(30, func(i) { { day = i + 1; value = 90.0 + (i.toFloat() * 0.1) } });
      };
      case ("oee") {
        Array.tabulate(30, func(i) { { day = i + 1; value = 85.0 + (i.toFloat() * 0.3) } });
      };
      case ("energy") {
        Array.tabulate(30, func(i) { { day = i + 1; value = 1.4 - (i.toFloat() * 0.01) } });
      };
      case (_) { [] };
    };
  };

  public query ({ caller }) func getSummaryStats() : async SummaryStats {
    {
      totalProductionToday = 42.5;
      oee = 85.2;
      recovery = 93.4;
      energyCostPerKg = 1.32;
      activePressCount = 3;
      breakdownHours = 5.2;
    };
  };

  public query ({ caller }) func getPressWiseData() : async [PressData] {
    [
      {
        pressName = "Press 1";
        output = 400.0;
        oee = 88.5;
        recovery = 94.2;
        status = "good";
      },
      {
        pressName = "Press 2";
        output = 325.0;
        oee = 82.0;
        recovery = 92.1;
        status = "warning";
      },
      {
        pressName = "Press 3";
        output = 275.0;
        oee = 78.4;
        recovery = 91.2;
        status = "critical";
      },
    ];
  };

  public query ({ caller }) func getTopDefects() : async [DefectData] {
    [
      {
        defectType = "Surface Defects";
        count = 120;
        percentage = 30.0;
      },
      {
        defectType = "Dimensional Errors";
        count = 80;
        percentage = 20.0;
      },
      {
        defectType = "Die Marks";
        count = 60;
        percentage = 15.0;
      },
      {
        defectType = "Mechanical Defects";
        count = 40;
        percentage = 10.0;
      },
    ];
  };

  public query ({ caller }) func getMaintenanceEvents() : async [MaintenanceEvent] {
    [
      {
        equipmentName = "Press 1";
        eventType = "breakdown";
        duration = 2.5;
        status = "completed";
      },
      {
        equipmentName = "Homogenizer";
        eventType = "PM";
        duration = 4.0;
        status = "in progress";
      },
      {
        equipmentName = "Press 2";
        eventType = "breakdown";
        duration = 1.2;
        status = "pending";
      },
    ];
  };

  public query ({ caller }) func getShiftSummaries() : async [ShiftSummary] {
    [
      {
        shiftName = "Shift 1";
        output = 150.0;
        oee = 88.0;
        recovery = 93.8;
      },
      {
        shiftName = "Shift 2";
        output = 120.0;
        oee = 82.0;
        recovery = 92.5;
      },
      {
        shiftName = "Shift 3";
        output = 100.0;
        oee = 79.0;
        recovery = 91.1;
      },
    ];
  };

  public shared ({ caller }) func updateKpi(dashboard : Text, newKpis : [Kpi]) : async () {
    kpiData.add(dashboard, newKpis);
  };
};

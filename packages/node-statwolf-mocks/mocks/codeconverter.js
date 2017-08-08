module.exports = function() {
  var mock = {};

  mock.compress = function() {
    return {"Items":[{"Serialized":"{\"Resolver\":\"return {\\n    \\\"IDataSourceConfig\\\": \\\"Statwolf.Redbull.DashboardBuilder.ServerConfig2\\\",\\n    \\\"IDataSourceClientConfig\\\": \\\"Statwolf.Redbull.DashboardBuilder.ClientConfig2\\\",\\n    \\\"IDataSourceSharedConfig\\\": \\\"Statwolf.Screens.DataSourceDashboard.DefaultSharedConfig\\\"\\n};\"}","Workspace":"Statwolf.Redbull.DashboardBuilder","Name":"BuilderDemo","ComponentType":"DashboardForm","Version":"1.0.0"}, {"Serialized":"{\"Resolver\":\"return {\\n    \\\"IDataSourceConfig\\\": \\\"Statwolf.Redbull.DashboardBuilder.ServerConfig2\\\",\\n    \\\"IDataSourceClientConfig\\\": \\\"Statwolf.Redbull.DashboardBuilder.ClientConfig2\\\",\\n    \\\"IDataSourceSharedConfig\\\": \\\"Statwolf.Screens.DataSourceDashboard.DefaultSharedConfig\\\"\\n};\"}","Workspace":"Statwolf.Redbull.DashboardBuilder","Name":"BuilderDemo", delete: true, "ComponentType":"DashboardForm","Version":"1.0.0"}]};
  };

  mock.expand = function() {
    return [];
  };

  return mock;
};

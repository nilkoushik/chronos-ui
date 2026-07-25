Feature: MediaGrid
  As a consumer of @chronos-ui/core
  I want the MediaGrid web component to render a primary and secondary media layout
  So that editorial 1+N grids display correctly

  Scenario: Renders primary and secondary media
    Given I mount the "media-grid" component as "MediaGrid" with:
      | primary-media   | {"id":"p1","title":"Premium Sound","media":{"type":"image","url":"/assets/img/placeholder-05.svg"}} |
      | secondary-media | [{"id":"s1","title":"Wireless Comfort","media":{"type":"image","url":"/assets/img/placeholder-06.svg"}},{"id":"s2","title":"Smart Integration","media":{"type":"image","url":"/assets/img/placeholder-07.svg"}}] |
    Then it should render without any page errors
    And it should contain an element matching ".chronos-media-primary img" with alt text "Premium Sound"
    And it should contain 3 elements matching ".chronos-media-asset"
    And the component should have no serious accessibility violations

  Scenario: Renders a loading skeleton
    Given I mount the "media-grid" component as "MediaGrid" with:
      | is-loading | true |
    Then it should render without any page errors

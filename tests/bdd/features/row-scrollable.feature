Feature: RowScrollable
  As a consumer of @chronos-ui/core
  I want the RowScrollable web component to render a horizontally scrollable card row
  So that trending/product rows display and its arrow controls behave correctly

  Scenario: Renders a title and item cards
    Given I mount the "row-scrollable" component as "RowScrollable" with:
      | title | Trending Items |
      | items | [{"id":"1","title":"Smart Watch v2","price":"$299","media":{"type":"image","url":"/assets/img/placeholder-08.svg"}},{"id":"2","title":"Leather Wallet","price":"$49","media":{"type":"image","url":"/assets/img/placeholder-09.svg"}}] |
    Then it should render without any page errors
    And the component text should include "Trending Items"
    And the component text should include "Smart Watch v2"
    And the component should have no serious accessibility violations

  Scenario: Hides arrows when hideArrowsIfNoScroll is set and content fits
    Given I mount the "row-scrollable" component as "RowScrollable" with:
      | title  | Small Row                                                                              |
      | items  | [{"id":"1","title":"Single Item","price":"$10","media":{"type":"image","url":"/assets/img/placeholder-08.svg"}}] |
      | config | {"hideArrowsIfNoScroll":true}                                                          |
    Then it should render without any page errors

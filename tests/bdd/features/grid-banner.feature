Feature: GridBanner
  As a consumer of @contentvidya/ui
  I want the GridBanner web component to render a responsive grid of cards
  So that catalog/category layouts work at any column count

  Scenario Outline: Renders the configured number of columns
    Given I mount the "grid-banner" component as "GridBanner" with:
      | columns | <columns> |
      | items   | [{"id":"1","title":"Women's","media":{"type":"image","url":"/assets/img/placeholder-02.svg"}},{"id":"2","title":"Men's","media":{"type":"image","url":"/assets/img/placeholder-03.svg"}},{"id":"3","title":"Footwear","media":{"type":"image","url":"/assets/img/placeholder-04.svg"}}] |
    Then it should render without any page errors
    And it should contain 3 elements matching "a"

    Examples:
      | columns |
      | 1       |
      | 2       |
      | 3       |
      | 4       |

  Scenario: Renders a loading skeleton
    Given I mount the "grid-banner" component as "GridBanner" with:
      | is-loading | true |
      | items      | [{"id":"1","title":"Women's","media":{"type":"image","url":"/assets/img/placeholder-02.svg"}}] |
    Then it should render without any page errors

  Scenario: Has no serious accessibility violations
    Given I mount the "grid-banner" component as "GridBanner" with:
      | columns | 3 |
      | items   | [{"id":"1","title":"Women's","media":{"type":"image","url":"/assets/img/placeholder-02.svg"}},{"id":"2","title":"Men's","media":{"type":"image","url":"/assets/img/placeholder-03.svg"}}] |
    Then it should render without any page errors
    And the component should have no serious accessibility violations

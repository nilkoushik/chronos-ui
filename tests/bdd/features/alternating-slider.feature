Feature: AlternatingSlider
  As a consumer of @contentvidya/ui
  I want the AlternatingSlider web component to render multi-column alternating scroll
  So that its layout renders correctly at any column count

  Scenario Outline: Renders the configured number of columns
    Given I mount the "alternating-slider" component as "AlternatingSlider" with:
      | items  | [{"id":"1","title":"Ocean Breeze"},{"id":"2","title":"Forest Trail"},{"id":"3","title":"Desert Sun"},{"id":"4","title":"Mountain Peak"}] |
      | config | {"columns":<columns>,"autoStart":false} |
    Then it should render without any page errors
    And it should contain <columns> elements matching ".contentvidya-alt-col"

    Examples:
      | columns |
      | 2       |
      | 3       |
      | 4       |

  Scenario: Renders title content
    Given I mount the "alternating-slider" component as "AlternatingSlider" with:
      | items  | [{"id":"1","title":"Ocean Breeze","subtitle":"Fresh styles"}] |
      | config | {"columns":2,"autoStart":false}                                 |
    Then it should render without any page errors
    And the component text should include "Ocean Breeze"
    And the component should have no serious accessibility violations

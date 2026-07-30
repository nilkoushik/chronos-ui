Feature: AnnouncementBar
  As a consumer of @contentvidya/ui
  I want the AnnouncementBar web component to render its message, colors, and optional link
  So that site-wide announcements display correctly

  Scenario: Renders a plain message with custom colors
    Given I mount the "announcement-bar" component as "AnnouncementBar" with:
      | message          | Free shipping on orders over $75 |
      | background-color | #8b5cf6                          |
      | text-color       | #ffffff                          |
    Then it should render without any page errors
    And the component text should include "Free shipping on orders over $75"
    And the component should not contain a "a" element
    And the component should have no serious accessibility violations

  Scenario: Renders as a link when mapLinks is provided
    Given I mount the "announcement-bar" component as "AnnouncementBar" with:
      | message   | Flash Sale! Shop now |
      | map-links | [{"url":"/sale"}]     |
    Then it should render without any page errors
    And it should contain 1 elements matching "a[href='/sale']"

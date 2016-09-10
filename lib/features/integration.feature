Feature: Integration Tests
  The given example projects should all compile successfully

  Scenario Outline: Building the <name> example project
    Given The <name> example project
    When it is built
    Then it should succeed

    Examples:
      | name        |
      | hello       |
      | two_targets |

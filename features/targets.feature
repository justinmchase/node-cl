Feature: Valid Target Files
  Validate various valid target files

  Scenario: Can load an empty file
    Given the empty target file
    Then it should have no targets

  Scenario: Can load file with no config section and a single target
    Given the single_target_no_config target file
    Then it should have one target
    And the first target should be named test

  Scenario: Can load a single nested target
    Given the single_under_targets_no_config target file
    Then it should have one target
    And the first target should be named one

  Scenario: Can load file with multiple top level targets
    Given the multiple_targets_no_config target file
    Then it should have two targets
    And the first target should be named one
    And the second target should be named two

  Scenario: Can load multiple nested targets
    Given the multiple_under_targets_no_config target file
    Then it should have two targets
    And the first target should be named one
    And the second target should be named two

  Scenario: Can load a file with an empty targets section
    Given the targets_only target file
    Then it should have zero targets

  Scenario: Can load a file with only a config section
    Given the config_only target file
    Then it should have zero targets

  Scenario: Can load a file with a config section and a top level target
    Given the top_level_target_with_config target file
    Then it should have one target
    And the first target should be named one

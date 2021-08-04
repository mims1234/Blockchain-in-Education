pragma solidity ^0.5.0;

contract Degree {
  string degree;

  function set(string memory _degree) public {
    degree = _degree;
  }

  function get() public view returns (string memory) {
    return degree;
  }
}

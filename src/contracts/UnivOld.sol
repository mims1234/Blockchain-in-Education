pragma solidity ^0.5.0;

contract Univ {
    
    address public ownerAddress = 0x049bB561227Ace1c8dFED55C4E9386cCb6D63702;
    
    struct StudentDetails {
        uint id;
        string name;
        address studentAddress;
    }
    
    struct StudentDegreeDetails {
        uint id;
        string degree_name;
        string year;
        string ipfsHASH;
        string orig_ipfsHASH;
        address studentAddress;
        uint shareID;
    }
    
    struct StudentDegreeDetails_Address {
        uint id;
        string degree_name;
        string year;
        string ipfsHASH;
        string orig_ipfsHASH;
        address studentAddress;
        uint shareID;
    }
    
    struct DegreeList {
        address studentAddress;
        uint degreeIDlength;
        uint[] degreeID;
    }
    
    struct ShareList {
        uint id;
        address studentAddress;
        string ipfsHASH;
        uint shareIDLength;
        string orig_ipfsHASH;
        address[] shareIDs;
    }
    
    address[] tempstring;
    uint[] temp = [1];
    string ok;
    
    mapping(address => bool) public degreeCompleted;
    mapping(address => bool) public registeredStudent;
    mapping(uint => StudentDegreeDetails) public studentdegreedetails;
    mapping(address => StudentDegreeDetails_Address) public std_add;
    mapping(address => StudentDetails) public studentdetail_address;
    mapping(address => DegreeList) public degreelist;
    mapping(uint => ShareList) public sharelist;

    uint public degreeCounts;
    uint public studentCounts;
    uint public shareCounts;
    bool public lastupload = false;
    bool public lastshare = false;
    bool public lastview = true;
    
    function getdegreeIDarr(address _addressid,uint _studentCount) private{
        degreelist[_addressid].degreeIDlength+=1;
        degreelist[_addressid].degreeID.push(_studentCount);
    }
    
    function share(address _useraddress,string memory _ipfsHASH, address _shareaddress) public{
        if(matchipfs(0, _ipfsHASH, _useraddress)!=0){
            shareCounts++;
            sharelist[matchipfs(0, _ipfsHASH, _useraddress)].shareIDLength+=1;
            sharelist[matchipfs(0, _ipfsHASH, _useraddress)].shareIDs.push(_shareaddress);
            lastshare = true;
        }else lastshare = false;
    }
    
    function viewDocCheck(uint count, address _visitoraddress, string memory _ipfsHASH, address _studentaddress) public view returns (bool){
        if(matchipfs(0, _ipfsHASH, _studentaddress)!=0){
            if(count==sharelist[studentdegreedetails[matchipfs(0, _ipfsHASH, _studentaddress)].shareID].shareIDLength){
                return false;
            }else{
                if(sharelist[studentdegreedetails[matchipfs(0, _ipfsHASH, _studentaddress)].shareID].shareIDs[sharelist[studentdegreedetails[matchipfs(0, _ipfsHASH, _studentaddress)].shareID].shareIDLength] == _visitoraddress){
                    return true;
                }else{
                    return viewDocCheck(count, _visitoraddress, _ipfsHASH, _studentaddress);
                }
            }
        }else return false;
    }
    
    function viewDoc(uint count, address _visitoraddress, string memory _ipfsHASH, address _studentaddress) public view returns (string memory){
        if(viewDocCheck(count, _visitoraddress, _ipfsHASH, _studentaddress)){
            return sharelist[studentdegreedetails[matchipfs(0, _ipfsHASH, _studentaddress)].shareID].orig_ipfsHASH;
        }else{
            return "";
        }
    }
    
    function matchipfs(uint count,string memory _ipfsHash, address _addressid) public view returns (uint degreeID){
        if(degreelist[_addressid].degreeIDlength>0) {
            if(count==degreelist[_addressid].degreeIDlength){
                count=0;
                return 0;
            }
            count++;
            if(keccak256(bytes(studentdegreedetails[count].ipfsHASH)) == keccak256(bytes(_ipfsHash))){
                return count;
            } else {
                return matchipfs(count,_ipfsHash,_addressid);
            }
        }
    }
    
    function getarr(address _addressid) public view returns (uint ret){
        uint _degreeID = uint(degreelist[_addressid].degreeIDlength)-1;
        return degreelist[_addressid].degreeID[_degreeID];
    }
    
    function getname(address _addressid) public view returns (string memory)  {
        return studentdetail_address[_addressid].name;
    }
    
    function checkipfs(uint count,string memory _ipfsHash, address _addressid) public view returns (bool){
        if(degreelist[_addressid].degreeIDlength>0) {
            if(count==degreelist[_addressid].degreeIDlength){
                count=0;
                return false;
            }
            count++;
            if(keccak256(bytes(studentdegreedetails[count].ipfsHASH)) == keccak256(bytes(_ipfsHash))){
                return checkipfs(count,_ipfsHash,_addressid);
            } else {
                return true;
            }
        }
    }

    function admission(string memory _name, address _addressid) public {
        if(!registeredStudent[_addressid] && ownerAddress==msg.sender){
            studentCounts++;
            studentdetail_address[_addressid] = StudentDetails(degreeCounts,_name,_addressid);
            registeredStudent[_addressid]=true;
        }
    }
    
    function upload (string memory _degree_name, string memory _year, string memory _ipfsHash, address _addressid, string memory _orig_ipfsHASH) public{
        if(registeredStudent[_addressid] && ownerAddress==msg.sender ){
            if(!degreeCompleted[_addressid]){
                degreeCounts ++;
                getdegreeIDarr(_addressid,degreeCounts);
                
                shareCounts++;
                tempstring.push(_addressid);
                sharelist[shareCounts] = ShareList(shareCounts, _addressid, _ipfsHash, 0, _orig_ipfsHASH, tempstring);
                
                studentdegreedetails[degreeCounts] = StudentDegreeDetails(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                std_add[_addressid] = StudentDegreeDetails_Address(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                degreelist[_addressid] = DegreeList(_addressid, 1,temp);
                degreeCompleted[_addressid]=true;
                lastupload=true;
            }
            else{
                if(checkipfs(0, _ipfsHash,_addressid)){
                    degreeCounts ++;
                    getdegreeIDarr(_addressid,degreeCounts);
                    
                    shareCounts++;
                    tempstring.push(_addressid);
                    sharelist[shareCounts] = ShareList(shareCounts, _addressid, _ipfsHash, 0, _orig_ipfsHASH, tempstring);
                    
                    studentdegreedetails[degreeCounts] = StudentDegreeDetails(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                    std_add[_addressid] = StudentDegreeDetails_Address(degreeCounts, _degree_name, _year, _ipfsHash,_orig_ipfsHASH, _addressid, shareCounts);
                    degreelist[_addressid] = DegreeList(_addressid, degreelist[_addressid].degreeIDlength,degreelist[_addressid].degreeID);
                    lastupload=true;
                } else lastupload=false;
            }
        }
    }
}
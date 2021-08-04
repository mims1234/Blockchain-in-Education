pragma solidity ^0.5.0;

contract Univ {
    
    // address public ownerAddress = 0x5B38Da6a701c568545dCfcB03FcB875f56beddC4;
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
        string degree_name;
        string ipfsHASH;
        uint shareIDLength;
        string orig_ipfsHASH;
        bool visibility;
        address[] shareIDs;
    }
    
    address[] tempstring;
    uint[] temp = [1];
    address[] array;
    uint tempData;
    
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
    bool public lastsharedel = false;
    
    
    function getdegreeIDarr(address _addressid,uint _studentCount) private{
        degreelist[_addressid].degreeIDlength+=1;
        degreelist[_addressid].degreeID.push(_studentCount);
    }
    
    function shareAtUpload(string memory _ipfsHASH, address _shareaddress) private{
        if(matchipfs(1, _ipfsHASH)!=0){
            sharelist[matchipfs(1, _ipfsHASH)].shareIDLength+=1;
            sharelist[matchipfs(1, _ipfsHASH)].shareIDs.push(_shareaddress);
            lastshare = true;
        }else lastshare = false;
    }
    
    function removeShare(string memory _ipfsHASH, uint _index) public{
        tempData = matchipfs(1, _ipfsHASH);
        if(tempData!=0){
            sharelist[tempData].shareIDs[_index] = sharelist[tempData].shareIDs[sharelist[tempData].shareIDs.length-1];
            sharelist[tempData].shareIDs.pop();
            lastsharedel = true;
        }else lastsharedel = false;
    }
    
    function share(string memory _ipfsHASH, address _shareaddress) public{
        if(matchipfs(1, _ipfsHASH)!=0){
            sharelist[matchipfs(1, _ipfsHASH)].shareIDLength+=1;
            sharelist[matchipfs(1, _ipfsHASH)].shareIDs.push(_shareaddress);
            lastshare = true;
        }else lastshare = false;
    }
    
    function viewDocVisibility(string memory _ipfsHASH) public{
        if(matchipfs(1, _ipfsHASH)!=0){
            if(sharelist[matchipfs(1, _ipfsHASH)].visibility){
                sharelist[matchipfs(1, _ipfsHASH)].visibility=false;
            } else {
                sharelist[matchipfs(1, _ipfsHASH)].visibility=true;
            }
        }
    }
    
    function viewDocCheck(uint count, address _visitoraddress, string memory _ipfsHASH) public view returns (bool){
        if(matchipfs(1, _ipfsHASH)!=0){
            if(count==sharelist[matchipfs(1, _ipfsHASH)].shareIDLength){
                return false;
            }else{
                if(sharelist[matchipfs(1, _ipfsHASH)].visibility){
                    return true;
                } else {
                    if(sharelist[matchipfs(1, _ipfsHASH)].shareIDs[count] == _visitoraddress){
                        return true;
                    }else{
                        count++;
                        return viewDocCheck(count, _visitoraddress, _ipfsHASH);
                    }
                }
            }
        }else return false;
    }
    
    function viewArray(uint _ix,uint _ix2) public view returns (address){
        return sharelist[_ix].shareIDs[_ix2];
    }
    
    
    function viewDoc(address _visitoraddress, string memory _ipfsHASH) public view returns (string memory){
        if(viewDocCheck(0, _visitoraddress, _ipfsHASH)){
            return sharelist[studentdegreedetails[matchipfs(1, _ipfsHASH)].shareID].orig_ipfsHASH;
        }else{
            return "No Access";
        }
    }
    
    function matchipfs(uint count,string memory _ipfsHash) public view returns (uint degreeID){
        if(degreeCounts+1!=count){
            if(keccak256(bytes(studentdegreedetails[count].ipfsHASH)) == keccak256(bytes(_ipfsHash))){
                return count;
            } else {
                count++;
                return matchipfs(count, _ipfsHash);
            }
        } else {
            return 0;
        }
    }

    function returnShareList(string memory _ipfsHASH) public returns(address[] memory){
        tempData = matchipfs(1, _ipfsHASH);
        if(tempData!=0){
            return sharelist[tempData].shareIDs;
        }
        tempData=0;
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
                count=0;
                return true;
            }
        } else {
            return false;
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
                getdegreeIDarr(_addressid,degreeCounts);
                degreeCounts ++;
                shareCounts++;
                
                sharelist[shareCounts] = ShareList(shareCounts, _addressid, _degree_name, _ipfsHash, 0, _orig_ipfsHASH, false, tempstring);
                
                studentdegreedetails[degreeCounts] = StudentDegreeDetails(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                std_add[_addressid] = StudentDegreeDetails_Address(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                degreelist[_addressid] = DegreeList(_addressid, 1,temp);
                degreeCompleted[_addressid]=true;
                lastupload=true;
                
                shareAtUpload(_ipfsHash,_addressid);
            }
            else{
                if(checkipfs(0, _ipfsHash,_addressid)){
                    getdegreeIDarr(_addressid,degreeCounts);
                    degreeCounts ++;
                    shareCounts++;
                    
                    sharelist[shareCounts] = ShareList(shareCounts, _addressid, _degree_name, _ipfsHash, 0, _orig_ipfsHASH, false, tempstring);
                    
                    studentdegreedetails[degreeCounts] = StudentDegreeDetails(degreeCounts, _degree_name, _year, _ipfsHash, _orig_ipfsHASH, _addressid, shareCounts);
                    std_add[_addressid] = StudentDegreeDetails_Address(degreeCounts, _degree_name, _year, _ipfsHash,_orig_ipfsHASH, _addressid, shareCounts);
                    degreelist[_addressid] = DegreeList(_addressid, degreelist[_addressid].degreeIDlength,degreelist[_addressid].degreeID);
                    lastupload=true;
                    
                    shareAtUpload(_ipfsHash,_addressid);
                } else lastupload=false;
            }
        } else lastupload=false;
    }
    
    function getOwenerAddress() public view returns (address){
        return ownerAddress;
    }
}
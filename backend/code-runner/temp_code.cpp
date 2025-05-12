#include <iostream>
#include <vector>
using namespace std;

vector<int> findEvenNumbers(const vector<int>& arr) {
    //Write your code here
    vector<int> evenNumbers;
    for (int num : arr) {
        if (num % 2 == 0) {
            evenNumbers.push_back(num);
        }
    }
    return evenNumbers;    
}

int main() {
    int n;
    cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; ++i) {
        cin >> arr[i];
    }

    vector<int> evenNumbers = findEvenNumbers(arr);

    if (evenNumbers.empty()) {
        cout << "-1";
    } else {
        for (int num : evenNumbers) {
            cout << num << " ";
        }
    }
    cout << endl;

    return 0;
}
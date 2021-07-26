elementSize = 0.5;
plateWidth = 5.0;
plateHeight = 10.0;

Point(1) = {0,0,0, elementSize};
Point(2) = {plateWidth,0,0, elementSize};
Point(3) = {plateWidth,plateHeight,0, elementSize};
Point(4) = {0,plateHeight,0, elementSize};

Line(1) = {1,2};
Line(2) = {2,3};
Line(3) = {3,4};
Line(4) = {4,1};

Curve Loop(1) = {1,2,3,4};
Plane Surface(1) = {1};

Physical Curve("Bottom") = {1};
Physical Curve("Top") = {3};

Mesh.SaveAll=1;
elementSize = 0.3;
reductionFactor = 2.0;
plateWidth = 5.0;
plateHeight = 10.0;
holeRadius = 2.0;
Point(1) = {0,0,0, elementSize};
Point(2) = {plateWidth,0,0, elementSize};
Point(3) = {plateWidth,plateHeight,0, elementSize};
Point(4) = {0,plateHeight,0, elementSize};
Point(5) = {plateWidth-holeRadius,0,0, elementSize/reductionFactor};
Point(6) = {plateWidth,holeRadius,0, elementSize/reductionFactor};

Line(1) = {1,5};
Circle(2) = {5,2,6};
Line(3) = {6,3};
Line(4) = {3,4};
Line(5) = {4,1};

Curve Loop(1) = {1,2,3,4,5};
Plane Surface(1) = {1};

Physical Curve("Bottom") = {1};
Physical Curve("Top") = {4};
Physical Curve("Right") = {3};
Physical Surface("Domain") = {1};

// Mesh.SaveAll=1;

// Mesh.ElementOrder = 2;
// Mesh.HighOrderOptimize = 2;
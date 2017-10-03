#import "ARWorksForYouComponentViewController.h"
#import <React/RCTRootView.h>

@implementation ARWorksForYouComponentViewController

- (instancetype)initWithSelectedArtist:(NSString *)artistID;
{
    return [self initWithSelectedArtist:artistID emission:nil];
}

- (instancetype)initWithSelectedArtist:(NSString *)artistID emission:(AREmission *)emission;
{
    if ((self = [super initWithEmission:emission
                            moduleName:@"WorksForYou"
                      initialProperties:artistID ? @{ @"selectedArtist": artistID } : nil])) {
        _selectedArtist = artistID;
    }
    return self;
}

- (void)viewWillAppear:(BOOL)animated
{
    [super viewWillAppear:animated];
    
    RCTRootView *rootView = self.view.subviews.firstObject;
    [rootView setAppProperties:@{ @"trigger1pxScrollHack": @YES }];
}

- (void)viewDidDisappear:(BOOL)animated
{
    [super viewDidDisappear:animated];
    
    RCTRootView *rootView = self.view.subviews.firstObject;
    [rootView setAppProperties:@{ @"trigger1pxScrollHack": @NO }];
}

@end

#import "ARRootViewController.h"
#import "ARAnimatedTickView.h"
#import "ARTickedTableViewCell.h"
#import "ARAdminTableViewCell.h"
#import <SAMKeychain/SAMKeychain.h>

#import "ARDefaults.h"

// See https://github.com/artsy/eigen/blob/master/Artsy/View_Controllers/Admin/ARAdminSettingsViewController.m
// for examples of how to work with this.

#import <Emission/ARArtistComponentViewController.h>
#import <Emission/ARHomeComponentViewController.h>
#import <Emission/ARGeneComponentViewController.h>
#import <Emission/ARWorksForYouComponentViewController.h>
#import "ARStorybookComponentViewController.h"

@implementation ARRootViewController

- (void)viewDidLoad
{
  [super viewDidLoad];

  ARTableViewData *tableViewData = [[ARTableViewData alloc] init];
  [self registerClass:ARTickedTableViewCell.class forCellReuseIdentifier:ARLabOptionCell];
  [self registerClass:ARAdminTableViewCell.class forCellReuseIdentifier:AROptionCell];

  ARSectionData *appData = [[ARSectionData alloc] init];
  [self setupSection:appData withTitle:[self titleForApp]];
  [appData addCellData:self.generateStagingSwitch];
  [tableViewData addSectionData:appData];

  ARSectionData *viewControllerSection = [self jumpToViewControllersSection];
  [tableViewData addSectionData:viewControllerSection];

#if TARGET_OS_SIMULATOR && defined(DEBUG)
  ARSectionData *developerSection = [self developersSection];
  [tableViewData addSectionData:developerSection];
#endif

  ARSectionData *userSection = [self userSection];
  [tableViewData addSectionData:userSection];

  self.tableViewData = tableViewData;
}

/// Sections

- (ARSectionData *)jumpToViewControllersSection
{
  ARSectionData *sectionData = [[ARSectionData alloc] init];
  [self setupSection:sectionData withTitle:@"View Controllers"];

  [sectionData addCellData:self.jumpToArtist];
  [sectionData addCellData:self.jumpToRandomArtist];
  [sectionData addCellData:self.jumpToHomepage];
  [sectionData addCellData:self.jumpToGene];
  [sectionData addCellData:self.jumpToRefinedGene];
  [sectionData addCellData:self.jumpToWorksForYou];

  return sectionData;
}

- (ARSectionData *)developersSection
{
  ARSectionData *sectionData = [[ARSectionData alloc] init];
  [self setupSection:sectionData withTitle:@"Developer"];

  [sectionData addCellData:self.jumpToStorybooks];
  return sectionData;
}


/// Cell Data

- (ARCellData *)jumpToStorybooks
{
  return [self tappableCellDataWithTitle:@"Open Storybooks" selection: ^{
    id viewController = [ARStorybookComponentViewController new];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToArtist
{
  return [self tappableCellDataWithTitle:@"Artist" selection: ^{
    id viewController = [[ARArtistComponentViewController alloc] initWithArtistID:@"david-shrigley"];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToRandomArtist
{
  NSString *sourceRoot = [NSProcessInfo processInfo].environment[@"SRCROOT"];
  NSString *artistListFromExample = @"../externals/metaphysics/schema/artist/maps/artist_title_slugs.js";
  NSString *slugsPath = [sourceRoot stringByAppendingPathComponent:artistListFromExample];

  NSFileManager *manager = [NSFileManager defaultManager];

  // Don't have the submodule? bail, it's no biggie
  if (![manager fileExistsAtPath:slugsPath]) { return nil; }

  // Otherwise lets support jumping to a random Artist
  return [self tappableCellDataWithTitle:@"Artist (random from metaphysics)" selection: ^{
    NSString *data = [NSString stringWithContentsOfFile:slugsPath encoding:NSUTF8StringEncoding error:nil];
    NSString *jsonString = [[[data
                             stringByReplacingOccurrencesOfString:@"export default" withString:@""]
                             stringByReplacingOccurrencesOfString:@"'" withString:@"\""]
                             stringByReplacingOccurrencesOfString:@",\n];" withString:@"]"];
    NSArray *artists = [NSJSONSerialization JSONObjectWithData:[jsonString dataUsingEncoding:NSUTF8StringEncoding] options:0 error:nil];
    u_int32_t rnd = arc4random_uniform((uint32_t)artists.count);
    id viewController = [[ARArtistComponentViewController alloc] initWithArtistID:[artists objectAtIndex:rnd]];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToHomepage
{
  return [self tappableCellDataWithTitle:@"Homepage" selection: ^{
    id viewController = [[ARHomeComponentViewController alloc] initWithEmission:nil];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToGene
{
  return [self tappableCellDataWithTitle:@"Gene" selection: ^{
    id viewController = [[ARGeneComponentViewController alloc] initWithGeneID:@"website"];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToRefinedGene
{
  // From: https://github.com/artsy/metaphysics/blob/master/schema/home/add_generic_genes.js
  return [self tappableCellDataWithTitle:@"Gene Refined" selection: ^{
    id viewController = [[ARGeneComponentViewController alloc] initWithGeneID:@"emerging-art" refineSettings:@{ @"medium": @"painting", @"price_range": @"50.00-10000.00" }];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)jumpToWorksForYou
{
  return [self tappableCellDataWithTitle:@"Works For You" selection:^{
    id viewController = [[ARWorksForYouComponentViewController alloc] initWithSelectedArtist:nil];
    [self.navigationController pushViewController:viewController animated:YES];
  }];
}

- (ARCellData *)generateStagingSwitch
{
  BOOL useStaging = [[NSUserDefaults standardUserDefaults] boolForKey:ARUseStagingDefault];
  NSString *title = [NSString stringWithFormat:@"Switch to %@ (Resets)", useStaging ? @"Production" : @"Staging"];

  ARCellData *crashCellData = [[ARCellData alloc] initWithIdentifier:AROptionCell];
  [crashCellData setCellConfigurationBlock:^(UITableViewCell *cell) {
    cell.textLabel.text = title;
  }];

  [crashCellData setCellSelectionBlock:^(UITableView *tableView, NSIndexPath *indexPath) {
    [self showAlertViewWithTitle:@"Confirm Switch" message:@"Switching servers may log you out. App will exit. Please re-open to log back in." actionTitle:@"Continue" actionHandler:^{

      [[NSUserDefaults standardUserDefaults] setBool:!useStaging forKey:ARUseStagingDefault];
      [[NSUserDefaults standardUserDefaults] synchronize];
      exit(0);
    }];
  }];
  return crashCellData;
}

- (ARSectionData *)userSection
{
  ARSectionData *sectionData = [[ARSectionData alloc] init];
  [self setupSection:sectionData withTitle:@"User"];

  [sectionData addCellData:self.logOutButton];
  return sectionData;
}

- (ARCellData *)logOutButton
{
  return [self tappableCellDataWithTitle:@"Log Out" selection:^{
    [self showAlertViewWithTitle:@"Confirm Log Out" message:@"" actionTitle:@"Continue" actionHandler:^{

      [self.authenticationManager logOut];
      exit(0);
    }];
  }];
}


@end
